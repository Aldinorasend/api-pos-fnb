import React, { useState, useMemo, useEffect } from 'react'
import { Paper, Divider, TextField, Button, InputLabel, Select, MenuItem, Box, FormControl, Tabs, Tab, Chip, useTheme, styled } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { selectMenu, resetData } from '@/States/MenuItems'
import Swal from 'sweetalert2'
import ListMenu from './ListMenu'
import BillsTotalPrice from './BillsTotalPrice'
import Loading from '@/Components/Loading'
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const CustomTab = styled(Tab)(({ theme }) => ({
  flex: 1,
  width: '100%',
  display: 'block',
  textAlign: 'center',
  borderRadius: '0.25rem',
  minHeight: '36px',
  padding: '0.25rem 0.5rem',
  fontSize: '0.875rem',
  fontWeight: 800,
  textTransform: 'none',
  transition: 'none',
  WebkitTapHighlightColor: 'transparent',
  backgroundColor: 'rgb(229 231 235)',
  color: 'rgb(31 41 55)',
  '&.Mui-selected': {
    backgroundColor: 'rgb(255 255 255)',
    color: 'rgb(31 41 55)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
}));

const tableData = [
  { number: 1, name: "Table 1" },
  { number: 2, name: "Table 2" },
  { number: 3, name: "Table 3" },
  { number: 4, name: "Table 4" },
  { number: 5, name: "Table 5" },
  { number: 6, name: "Table 6" },
  { number: 7, name: "Table 7" },
  { number: 8, name: "Table 8" },
  { number: 9, name: "Table 9" },
  { number: 10, name: "Table 10" },
  { number: 11, name: "Table 11" },
  { number: 12, name: "Table 12" },
  { number: 13, name: "Table 13" },
  { number: 14, name: "Table 14" },
  { number: 15, name: "Table 15" },
  { number: 16, name: "Table 16" },
];

const calculateMenuPrice = (item) => {
  const flatModifiers = item.modifiers.flatMap(v => v.modifier_options)
  const variantCost = item.variants.reduce((t,v) => t+(v.id == item.selectedVariant && v.price), 0);
  const modifierCost = flatModifiers.reduce((t,v) => t+(item.selectedModifiers.includes(v.id) && v.price), 0);
  return (variantCost + modifierCost) * item.count;
}

const calculateOrderTotal = (order) => {
  return order.reduce((t,v) => t + calculateMenuPrice(v),0)
}
const BillsItem = ({ api, token, printer_api, outlet }) => {
  const [customer, setCustomer] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [referralData, setReferralData] = useState(null);
  const [paymentData, setPaymentData] = useState([])
  const [discountData, setDiscountData] = useState([])
  const [validateReferralCode, setValidateReferralCode] = useState(false)
  const [discount, setDiscount] = useState({})
  const [payment, setPayment] = useState({})
  const [orderType, setOrderType] = useState(outlet.is_dinein ? 'dinein' : 'takeaway');
  const [tableNumber, setTableNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const data = useSelector(selectMenu)
  const dispatch = useDispatch()
  const theme = useTheme();

  const calculatedTotal = useMemo(() => {
    let total = calculateOrderTotal(data);
    if (discount && discount.id) {
      if (discount.type == "percent") {
        total -= total * discount.amount / 100
      } else {
        total -= discount.amount
      }
    }
    if (referralData && referralData.id) {
      total -= total * referralData.discount / 100
    }
    return total
  }, [data, discount, referralData])

  useEffect(() => {
    const getDataPayment = async () => {
      const data = await fetch(`${api}api/payment`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const json = await data.json()

      setPaymentData(json.data)
      setPayment(json.data.at(-1))
    }

    const getDataDiscount = async () => {
      const data = await fetch(`${api}api/discount/outlet`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const json = await data.json()


      const NoDiscount = {
        id: null,
        name: "No Discount",
        type: "fixed",
        amount: 0
      }

      setDiscountData([
        NoDiscount,
        ...json.data
      ])
      setDiscount(NoDiscount)
    }
    getDataDiscount()
    getDataPayment()
  }, [])


  const handleChangePayment = (e) => {
    setPayment(e.target.value)
  }

  const handleChange = (e) => {
    setCustomer(e.target.value)
  }

  const handleDiscountChange = (e) => {
    setDiscount(e.target.value)
  }

  const handleOrderTypeChange = (event, newValue) => {
    setOrderType(newValue);
  };

  const handleTableNumberChange = (e) => {
    setTableNumber(e.target.value);
  }

  const CheckReferralCode = async (e) => {
    if (referralCode == "") {
      Swal.fire(
        "Warning",
        "Referral Code tidak boleh kosong",
        "warning"
      )
      return;
    }

    const data = await fetch(`${api}api/referralcode/verified?code=${referralCode}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })

    const json = await data.json();

    if (json.status) {
      Swal.fire(
        "Berhasil",
        json.message,
        "success"
      )
      setReferralData(json.data)
      setValidateReferralCode(true)
    } else {
      Swal.fire(
        "Error",
        json.message,
        "warning"
      )
      setReferralData(null)
      return;
    }
  }

  const clearReferralCode = () => {
    setReferralData(null)
    setReferralCode("")
    setValidateReferralCode(false)
  }

  const printLabel = async (id) => {
    await fetch(`${printer_api}/print-label/${id}`, {
      method: 'GET',
    });
  };

  const printReceipt = async (id) => {
    await fetch(`${printer_api}/print-bill/${id}`, {
      method: 'GET',
    });
  };

  const printKitchen = async (id) => {
    await fetch(`${printer_api}/print-kitchen/${id}`, {
      method: 'GET',
    });
  };

  const handleClick = async () => {
    if (!navigator.onLine) {
      Swal.fire(
        "Error",
        "Tidak ada koneksi internet. Silakan periksa koneksi Anda dan coba lagi.",
        "warning"
      );
      return;
    }

    if (customer.length == 0) {
      new Swal(
        "Error",
        "Nama Pelanggan Tidak Boleh Kosong",
        "warning"
      )
      return;
    }

    if (data.length == 0) {
      new Swal(
        "Error",
        "Silahkan melakukan pemesanan menu",
        "warning"
      )
      return;
    }

    if (payment.length == 0) {
      Swal.fire(
        "Error",
        "Metode Pembayaran Tidak Boleh Kosong",
        "warning"
      )

      return;
    }

    setIsLoading(true)

    const orderData = {
      customer_name: customer,
      outlet_id: outlet.id,
      order_payment: payment.id,
      order_type: orderType,
      order_table: tableNumber,
      order_totals: calculatedTotal,
      order_details: data.map(v => ({
        notes: v.notes,
        product_id: v.id,
        qty: v.count,
        variant_id: v.selectedVariant,
        modifier_option_ids: v.selectedModifiers
      }))
    }
    if (referralData) {
      orderData.referral_code = referralCode
    }
    if (discount?.id) {
      orderData.discount_id = discount.id
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      setIsLoading(false);
      Swal.fire(
        "Error",
        "Proses terlalu lama. Silakan periksa koneksi internet Anda dan coba lagi.",
        "warning"
      );
    }, 30000); // 30-second timeout

    try {
      const response = await fetch(`${api}api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify(orderData),
        signal: controller.signal,
      });
  
      clearTimeout(timeoutId);
  
      const json = await response.json();
      if (json.status == "success") {
        const result = await Swal.fire({
          title: "Success",
          icon: "success",
          text: "Berhasil Melakukan Pemesanan",
          confirmButtonText: outlet.is_label ? "Cetak Label" : "Cetak Struk",
          confirmButtonColor: '#3085d6',
          cancelButtonText: "Pemesanan Selesai",
          showCancelButton: true
        });
        setIsLoading(false);
        dispatch(resetData());
        setCustomer("");
        setTableNumber("");
        setPayment(paymentData.at(-1));
        setDiscount(discountData.at(0));
        setReferralCode("");
        setReferralData(null);
        setValidateReferralCode(false);
        if (result.isConfirmed) {
          if (outlet.is_label) {
            printLabel(json.data.id);
          } else {
            printReceipt(json.data.id);
      
            const CopyResult = await Swal.fire({
              title: "Invoice Copy",
              icon: "question",
              text: "Cetak Struk Salinan?",
              confirmButtonText: "Ya",
              confirmButtonColor: "#3085d6",
              cancelButtonText: "Tidak",
              showCancelButton: true,
            });
      
            if (CopyResult.isConfirmed) {
              printReceipt(json.data.id);
            }
          }
        }

        if (outlet.is_kitchen) {
          const kitchenResult = await Swal.fire({
            title: "Kitchen Print",
            icon: "question",
            text: "Cetak Struk untuk Kitchen?",
            confirmButtonText: "Ya",
            confirmButtonColor: "#3085d6",
            cancelButtonText: "Tidak",
            showCancelButton: true,
          });
          if (kitchenResult.isConfirmed) {
            printKitchen(json.data.id);
          }
        }
      } else {
        await Swal.fire({
          title: "Error",
          icon: "error",
          text: json.message,
          confirmButtonText: "Oke",
        });
        setIsLoading(false);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log("Request was aborted");
      }
    }
  }

  return (
    <Paper sx={{ width: 350, height: '100vh', backgroundColor: "white", border: "1px solid rgba(0, 0, 0, 0.23)" }} elevation={0} square>
      <Box sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.23)", marginBottom: "15px" }}>
        <h2 style={{ fontWeight: "bold", fontSize: "26px", paddingLeft: "10px", marginTop: "15px", marginBottom: "15px" }}>Order List</h2>
      </Box>
      <Box sx={{ paddingX: '10px' }}> 
        <Box
          sx={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgb(229 231 235)',
            borderRadius: '0.375rem',
            p: '3px',
            textAlign: 'center',
            marginBottom: '10px',
          }}
        >
          <Tabs
            value={orderType}
            onChange={handleOrderTypeChange}
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{
              width: '100%',
              minHeight: '36px',
            }}
          >
            <CustomTab label="Dine In" value="dinein" disableRipple disabled={!outlet.is_dinein} />
            <CustomTab label="Take away" value="takeaway" disableRipple />
          </Tabs>
        </Box>
      </Box>
      

      <label style={{ paddingLeft: "10px", fontWeight:'bold' }}>Customer Information</label>
      <Box sx={{ padding: '10px 10px', display: 'grid', gap: 2 }}>
        <TextField size="small" label="Name" variant="outlined" onChange={handleChange} value={customer} fullWidth />
        {orderType === 'dinein' && (
          <FormControl size="small" fullWidth>
            <InputLabel id="tableLabel">Table Number</InputLabel>
            <Select
              id='table'
              labelId="tableLabel"
              label="Table Number"
              value={tableNumber}
              onChange={handleTableNumberChange}
            >
              <MenuItem value="" disabled>
                Choose Table
              </MenuItem>
              {tableData.map((table, idx) => (
                <MenuItem key={idx} value={table.number}>
                  {table.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <Divider sx={{ margin: '0px 10px 10px 10px' }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 10px", marginBottom: "10px" }}>
        <label style={{ fontWeight: "bold" }}>
          Items 
          <Chip label={data.length} color="primary" size="small" sx={{ marginLeft: '4px' }} /> 
        </label>
        <Chip label="Clear All" size="small" color="error" onClick={() => { dispatch(resetData()); setValidateReferralCode(false); setReferralCode("") }}></Chip>
      </Box>
      <ListMenu />
      
      {/* Bottom Section */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          backgroundColor: 'white',
          borderTop: '1px solid rgba(0, 0, 0, 0.23)',
          zIndex: 1,
        }}
      >
        <Box sx={{ padding: '10px', margin: '10px 0px', display: 'grid', gap:2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="discount">Discount</InputLabel>
              <Select
                labelId='discount'
                label="Discount"
                id='diskon'
                value={discount}
                size="small"
                onChange={handleDiscountChange}
              >
                {
                  discountData.map((val, idx) => {
                    return (
                      <MenuItem key={idx} value={val}>{val.name}</MenuItem>
                    )
                  })
                }
              </Select>
            </FormControl>

            <TextField
              size="small"
              id="outlined-basic"
              label="Referral Code"
              variant="outlined"
              onChange={(e) => { setReferralData(null); setReferralCode(e.target.value) }}
              value={referralCode}
              InputProps={{
                endAdornment: 
                <InputAdornment position='end'>
                  <IconButton onClick={validateReferralCode ? clearReferralCode : CheckReferralCode} edge="end">
                    {validateReferralCode ? <ClearIcon /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>,
                style: {
                  color: validateReferralCode ? 'green' : '',
                },
              }}
              fullWidth 
            
            />
          </Box>
          
          <FormControl fullWidth>
            <InputLabel id="paymentLabel">Payment Method</InputLabel>
            <Select
              labelId='paymentLabel'
              label="Payment Method"
              id='payment'
              value={payment}
              size="small"
              onChange={handleChangePayment}
            >
              {
                paymentData.map((val, idx) => {
                  return (
                    <MenuItem key={idx} value={val}>{val.payment_name}</MenuItem>
                  )
                })
              }
            </Select>
          </FormControl>
        </Box>
        
        <Divider sx={{ margin: '10px 10px 0px 10px' }} />
        
        <BillsTotalPrice totalPrice={calculatedTotal} />
        <Button
          variant="contained"
          onClick={handleClick}
          sx={{
            width: "100%",
            margin: "0px",
            paddingY: "15px",
            borderRadius: "0px",
            fontWeight: "bold",
            backgroundColor: theme.palette.primary.main,
          }}
          disabled={isLoading}
        >
          {isLoading ? <Loading /> : "Place Order"}
        </Button>
      </Box>
    </Paper >
  )
}

export default BillsItem
