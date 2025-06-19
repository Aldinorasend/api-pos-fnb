import { useState, useEffect, useMemo } from 'react';
import { Backdrop, CircularProgress, Paper, Box, IconButton, Tooltip, Select, MenuItem, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableCell, TableHead, TableRow, FormControl, TableFooter, Chip, Stack, Autocomplete, Grid, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import User from '@/Layouts/User';
import useCurrencyRupiah from '@/hooks/useCurrencyRupiah';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { MaterialReactTable } from 'material-react-table';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SellIcon from '@mui/icons-material/Sell';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import usePageVisibility from '@/hooks/usePageVisibility';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import StorefrontIcon from '@mui/icons-material/Storefront';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { usePage } from '@inertiajs/inertia-react';
import { Edit } from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'

dayjs.extend(utc);
dayjs.extend(timezone);

const OrderPage = (props) => {
  const [order, setOrder] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().tz('Asia/Jakarta'));
  const [endDate, setEndDate] = useState(dayjs().tz('Asia/Jakarta'));
  const [outlet, setOutlet] = useState('');
  const [outlets, setOutlets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedSeeDetails, setSelectedSeeDetails] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const theme = useTheme();
  const { translations } = usePage().props;

  const isPageVisible = usePageVisibility();

  useEffect(() => {
    getOutlets();
  }, []);

  const getOutlets = async () => {
    try {
      const response = await fetch(`${props.api}api/outlet/current/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });

      const json = await response.json();

      if (json.status) {
        setOutlets(json.data);
        setOutlet(json.data[0]?.id || '');
        getData(json.data[0]?.id || '', startDate, endDate);
      } else {
        Swal.fire('Error', 'Failed to load outlets', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getData = async (selectedOutlet, startDate, endDate) => {
    try {
      const start = startDate.tz('Asia/Jakarta').format('YYYY-MM-DD');
      const end = endDate.tz('Asia/Jakarta').format('YYYY-MM-DD');
      
      const data = await fetch(`${props.api}api/order/outlet/${selectedOutlet}?start_date=${start}&end_date=${end}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });

      const json = await data.json();

      if (json.status === "success") {
        setOrder(json.data || []);
        const totalAmount = json.data.reduce((acc, curr) => acc + curr.order_total, 0);
        setTodayTotal(totalAmount);
      } else {
        Swal.fire('Error', 'Failed to load orders', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDateChange = (value) => {
    const gmt7Date = dayjs(value).tz('Asia/Jakarta').startOf('day');
    setStartDate(gmt7Date);
    getData(outlet, gmt7Date, endDate);
  };

  const handleEndDateChange = (value) => {
    const gmt7Date = dayjs(value).tz('Asia/Jakarta').endOf('day');
    setEndDate(gmt7Date);
    getData(outlet, startDate, gmt7Date);
  };

  const handleOutletChange = (event) => {
    setOutlet(event.target.value);
    getData(event.target.value, startDate, endDate);
  };

  const deleteOrder = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: 'Anda tidak akan dapat mengembalikannya!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
    });

    if (result.isConfirmed) {
      await fetch(`${props.api}api/order/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      getData(outlet, startDate, endDate);
      Swal.fire('Dihapus!', 'Pesanan telah dihapus.', 'success');
    }
  };

  const openDetailsDialog = (details) => {
    setSelectedSeeDetails(details);
    setOpenDetailDialog(true);
  };

  const closeDetailsDialog = () => {
    setOpenDetailDialog(false);
  };

  const columns = useMemo(() => [
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      size: 150,
    },
    {
      accessorKey: 'order_type',
      header: 'Order Type',
      size: 150,
      Cell: ({ row }) => {
        return (
          <div>
            <div>{row.original.order_type}</div>
            {row.original.order_table && (
              <Chip label={'Table '+ row.original.order_table} color="primary" size="small" style={{ marginTop: '4px' }} />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'order_details',
      header: 'Products Order',
      size: 200,
      accessorFn: row => row.order_details.map(detail => {
        const product = detail.product.name;
        const variant = detail.variants?.variant_name !== 'default' ? detail.variants.variant_name : '';
        const modifiers = detail.modifiers.map(mod => mod.modifier_name).join(', ');
        const notes = detail.notes || '';
        return `${product} ${variant} ${modifiers} ${notes}`;
      }).join(' '),
      Cell: ({ cell }) => (
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {cell.row.original.order_details.map((detail, index) => (
            <li key={index} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px' }}>
              <span style={{ marginRight: '5px', paddingTop: '0px' }}>-</span>
              <div>
                {detail.product.name}
                {detail.variants && detail.variants.variant_name !== 'default' && (
                  <> - {detail.variants.variant_name}</>
                )} <strong>X {detail.quantity}</strong>
                <br />
                {detail.modifiers.length > 0 && (
                  <span>
                    <div style={{ color: '#565656' }}>
                      {detail.modifiers.map((modifier, mIndex) => (
                        <Chip label={modifier.modifier_name} size="small" color="primary"/>
                      ))}
                    </div>
                  </span>
                )}
                {detail.modifiers.length > 0 && detail.notes && <br />} 
                {detail.notes && (
                  <span>"{detail.notes}"</span>
                )}
              </div>

            </li>
          ))}
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '5px', visibility: 'hidden' }}>-</span>
            <Typography 
              variant="body2"  
              sx={{ 
                fontFamily: 'Nunito',
                fontSize: '14px',
                fontWeight: 700,
                lineHeight: '19.1px',
                textAlign: 'left',
                mt: 1, 
                cursor: 'pointer', 
                color: '#007BFF', 
                display: 'flex', 
                alignItems: 'center',
              }} 
              onClick={() => openDetailsDialog(cell.row.original)}
            >
              SEE DETAILS 
              <OpenInNewIcon 
                sx={{ 
                  color: '#036DB9',
                  fontSize: 'inherit', 
                  marginLeft: '2px', 
                  position: 'relative', 
                  top: '0.0001em' 
                }} 
              />
            </Typography>
          </li>
        </ul>
      ),
    },    
    {
      accessorKey: 'order_total',
      header: 'Total Price',
      size: 100,
      Cell: ({ cell }) => useCurrencyRupiah(cell.row.original.order_total),
    },
    {
      accessorKey: 'cashier.name',
      header: 'Cashier',
      size: 100,
    },
    {
      accessorKey: 'payment.payment_name',
      header: 'Payment Method',
      size: 150,
    },
    {
      accessorKey: 'created_at',
      header: 'Order Date',
      size: 150,
      Cell: ({ cell }) => dayjs(cell.row.original.created_at).tz('Asia/Jakarta').toDate().toLocaleString('id'),
    },
  ], []);

  const printLabel = async (id) => {
    await fetch(`${props.printer_api}/print-label/${id}`, {
      method: 'GET',
    });
  };

  const printReceipt = async (id) => {
    await fetch(`${props.printer_api}/print-bill/${id}`, {
      method: 'GET',
    });
  };

  const printKitchen = async (id) => {
    await fetch(`${props.printer_api}/print-kitchen/${id}`, {
      method: 'GET',
    });
  };

  if (isLoading) {
    return (
      <User>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </User>
    );
  }

  return (
    <User title={translations.order_history} userType={props.auth.user.role_id}>
    <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ width: "100%", maxWidth: "200px" }}>
          <Typography sx={{ mx: 0, fontWeight: 'bold'}}>Outlet</Typography>
          <FormControl sx={{ mx: 0, mb: 2, width: 200, bgcolor: "white" }} size="small">
            <Select
              value={outlet}
              onChange={handleOutletChange}
              sx= {{bgcolor: "white"}}
            >
              {outlets.map((outlet) => (
                <MenuItem key={outlet.id} value={outlet.id}>
                  <div style={{display:'flex', alignItems:'center'}}>
                    <StorefrontIcon sx={{mr: 1}} />
                    {outlet.outlet_name}
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
          <Box sx={{ width: "100%", maxWidth: "400px" }}>
            <Typography sx={{ mx: 0, fontWeight: 'bold'}}>{translations.date}</Typography>
              <div style={{ display: 'flex', alignItems:'center' }}>
              <DatePicker
                    value={startDate}
                    onChange={handleStartDateChange}
                    sx={{
                      backgroundColor: "white",
                      '& .MuiInputBase-input': {
                        padding: '9.5px 14px',  
                      },
                    }}
                    renderInput={(params) => (
                      <TextField {...params} 
                      />
                    )}
                  />
                  <Typography sx={{ mx: 1 }}>-</Typography>
                  <DatePicker
                    value={endDate}
                    onChange={handleEndDateChange}
                    sx={{
                      backgroundColor: "white",
                      '& .MuiInputBase-input': {
                        padding: '9.5px 14px', 
                      },
                    }}
                    renderInput={(params) => (
                      <TextField {...params} />
                    )}
                  />
              </div>
          </Box>
      </Box>
      <Paper sx={{ width: "100%", overflow: "hidden", padding: "20px" }}>
        <br />
        <MaterialReactTable
          columns={columns}
          data={order}
          enableRowNumbers
          initialState={{
            density: 'compact',
            pagination: {
              pageSize: 100,
            },
          }}
          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex' }}>
              {(outlets.find(item => item.id === outlet)?.is_label === 1) && (
                <Tooltip arrow title="Print Label">
                  <IconButton onClick={() => printLabel(row.original.id)} color="primary">
                    <SellIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip arrow title="Print Receipt">
                <IconButton onClick={() => printReceipt(row.original.id)} color="primary">
                  <ReceiptIcon />
                </IconButton>
              </Tooltip>
              {(outlets.find(item => item.id === outlet)?.is_kitchen === 1) && (
                <Tooltip arrow title="Print Kitchen">
                  <IconButton onClick={() => printKitchen(row.original.id)} color="primary">
                    <LocalDiningIcon />
                  </IconButton>
                </Tooltip>
              )}
              {([1, 2].includes(props.auth.user.role_id)) && (
                <>
                  <Tooltip arrow title="Edit Order">
                    <IconButton onClick={() => { setEditingRow(row.original);setEditModalOpen(true); }} color="warning">
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip arrow title="Delete Order">
                    <IconButton onClick={() => deleteOrder(row.original.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}
          enableRowActions
        />
        <Box sx={{ padding: '10px', textAlign: 'left' }}>
          <strong><Typography variant="h6" component="div">
            Total: {useCurrencyRupiah(todayTotal)}
          </Typography></strong>
        </Box>
      </Paper>
      <Dialog open={openDetailDialog} onClose={closeDetailsDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ marginBottom: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold" color="black">No</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {selectedSeeDetails?.id 
                  ? selectedSeeDetails.id.split('-').pop()
                  : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold" color="black">Name</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{selectedSeeDetails?.customer?.name ?? 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold" color="black">Cashier</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{selectedSeeDetails?.cashier?.name ?? 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold" color="black">Date</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">{selectedSeeDetails?.created_at ?? 'N/A'}</Typography>
            </Grid>
          </Grid>
          
          <Table sx={{ backgroundColor: '#f5f5f5' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Qty</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Products Order</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Price</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold' }}>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedSeeDetails.order_details?.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.quantity}</TableCell>
                  <TableCell>
                  {detail.product.name}  
                    {detail.variants && detail.variants.variant_name !== 'default' && (
                      <> - {detail.variants.variant_name}</>
                    )} 
                    <br />
                    {detail.modifiers.length > 0 && (
                      <span>
                        <div style={{ color: '#565656' }}>
                          {detail.modifiers.map((modifier, mIndex) => (
                            <Chip label={`${modifier.modifier_name}${modifier.modifier_price > 0 ? ` + ${useCurrencyRupiah(modifier.modifier_price)}` : ''}`}
                            size="small" color="primary"/>
                          ))}
                        </div>
                      </span>
                    )}
                    {detail.notes && (
                      <span>"{detail.notes}"</span>
                    )}
                  </TableCell>
                  <TableCell>{useCurrencyRupiah(detail.price / detail.quantity)}</TableCell>
                  <TableCell>{useCurrencyRupiah(detail.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter sx={{ fontSize: '0.875rem'}}>
              <TableRow>
                <TableCell colSpan={3} sx={{ color: 'black', fontWeight: 'bold', textAlign: 'right', borderBottom: 'none', fontSize: '0.875rem' }}>Subtotal</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold', borderBottom: 'none', fontSize: '0.875rem' }}>
                  {useCurrencyRupiah(selectedSeeDetails?.order_subtotal ?? 0)}
                </TableCell>
              </TableRow>
              {selectedSeeDetails?.discount && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: 'black', fontWeight: 'bold', textAlign: 'right', borderBottom: 'none', fontSize: '0.875rem' }}>
                    Discount ({selectedSeeDetails.discount.type === 'percent' 
                      ? `${selectedSeeDetails.discount.amount}%` 
                      : `Fixed`})
                  </TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 'bold', color: 'red', borderBottom: 'none', fontSize: '0.875rem' }}>
                    {selectedSeeDetails.discount.type === 'percent' 
                      ? `-${useCurrencyRupiah((selectedSeeDetails.order_subtotal * selectedSeeDetails.discount.amount) / 100)}` 
                      : `-${useCurrencyRupiah(selectedSeeDetails.discount.amount)}`}
                  </TableCell>
                </TableRow>
              )}
              {selectedSeeDetails?.referral && (
                <TableRow>
                  <TableCell colSpan={3} sx={{ color: 'black', fontWeight: 'bold', textAlign: 'right', borderBottom: 'none', fontSize: '0.875rem' }}>
                    Referral ({selectedSeeDetails.referral.code}) - {selectedSeeDetails.referral.discount}% 
                  </TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 'bold', color: 'red', borderBottom: 'none', fontSize: '0.875rem' }}>
                    {selectedSeeDetails.discount
                      ? `-${useCurrencyRupiah(
                          ((selectedSeeDetails.order_subtotal - (selectedSeeDetails.discount.type === 'percent'
                            ? (selectedSeeDetails.order_subtotal * selectedSeeDetails.discount.amount) / 100
                            : selectedSeeDetails.discount.amount)) * selectedSeeDetails.referral.discount) / 100
                        )}`
                      : `-${useCurrencyRupiah(
                          (selectedSeeDetails.order_subtotal * selectedSeeDetails.referral.discount) / 100
                        )}`}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3} sx={{ color: 'black', fontWeight: 'bold', textAlign: 'right', borderBottom: 'none', fontSize: '0.875rem' }}>Total</TableCell>
                <TableCell sx={{ color: 'black', fontWeight: 'bold', borderBottom: 'none', fontSize: '0.875rem' }}>
                  {useCurrencyRupiah(selectedSeeDetails?.order_total ?? 0)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetailsDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <EditOrderModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={() => getData(outlet, startDate, endDate)}
        data={editingRow}
        setData={setEditingRow}
        api={props.api}
        outlet={outlet}
      />
    </User>
  );
};

export const EditOrderModal = ({ open, onClose, data, onSubmit, setData, api, outlet }) => {
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state for fetching data

  // Fetch data only when modal is opened
  useEffect(() => {
    if (open) {
      setLoading(true); // Set loading to true when fetching starts
      const fetchCustomers = async () => {
        try {
          const response = await fetch(`${api}api/customer`, {
            headers: {
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const customerData = await response.json();
            setCustomers(customerData.data);
          } else {
            throw new Error('Failed to fetch customers');
          }
        } catch (error) {
          console.error(error.message);
        }
      };

      const fetchPaymentMethods = async () => {
        try {
          const response = await fetch(`${api}api/payment`, {
            headers: {
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const paymentData = await response.json();
            setPaymentMethods(paymentData.data);
          } else {
            throw new Error('Failed to fetch payment methods');
          }
        } catch (error) {
          console.error(error.message);
        }
      };

      const fetchCashiers = async () => {
        try {
          const response = await fetch(`${api}api/outlet/${outlet}`, {
            headers: {
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const cashierData = await response.json();
            setCashiers(cashierData.data.users);
          } else {
            throw new Error('Failed to fetch cashiers');
          }
        } catch (error) {
          console.error(error.message);
        }
      };

      setOrderTypes([
        { value:'dinein', label: 'Dine In' },
        { value:'takeaway', label: 'Takeaway' },
        { value:'delivery', label: 'Delivery' },
      ]);

      Promise.all([fetchCustomers(), fetchPaymentMethods(), fetchCashiers()])
        .then(() => setLoading(false)) // Once all data is fetched, stop loading
        .catch(() => setLoading(false));
    }
  }, [open, api, outlet]); // Add 'open' as a dependency

  const handleDateChange = (newValue) => {
    const formattedDate = dayjs(newValue).tz('Asia/Jakarta').format();
    setData((prevData) => ({
      ...prevData,
      created_at: formattedDate,
    }));
  };

  const handleCustomerChange = (event, newValue) => {
    setData((prevData) => ({
      ...prevData,
      customer_id: newValue ? newValue.id : null,
    }));
  };

  const handlePaymentChange = (event, newValue) => {
    setData((prevData) => ({
      ...prevData,
      order_payment: newValue ? newValue.id : null,
    }));
  };

  const handleCashierChange = (event, newValue) => {
    setData((prevData) => ({
      ...prevData,
      order_cashier: newValue ? newValue.id : null,
    }));
  };

  const handleOrderTypeChange = (event, newValue) => {
    setData((prevData) => ({
      ...prevData,
      order_type: newValue ? newValue.value : null,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`${api}api/order/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422) {
          setErrors(errorData.errors);
        } else {
          throw new Error(errorData.message || 'An error occurred');
        }
      } else {
        const data = await response.json();
        Swal.fire("Success", `${data.message}`, "success");

        onSubmit();
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">Edit Order</DialogTitle>
      <DialogContent>
        <Stack
          sx={{
            width: '100%',
            minWidth: { xs: '300px', sm: '360px', md: '500px' },
            gap: '1.5rem',
            paddingTop: '1rem',
          }}
        >
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" width="100%">
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={customers}
                getOptionLabel={(option) => option.name}
                value={customers.find((customer) => customer.id === data.customer_id) || null}
                onChange={handleCustomerChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Customer Name"
                    error={!!errors.customer_id}
                    helperText={errors.customer_id}
                  />
                )}
              />

              <Autocomplete
                options={cashiers}
                getOptionLabel={(option) => option.name}
                value={cashiers.find((cashier) => cashier.id === data.order_cashier) || null} 
                onChange={handleCashierChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Cashier"
                    error={!!errors.order_cashier}
                    helperText={errors.order_cashier}
                  />
                )}
              />

              <Autocomplete
                options={paymentMethods}
                getOptionLabel={(option) => option.payment_name} 
                value={paymentMethods.find((paymentMethod) => paymentMethod.id === data.order_payment) || null}
                onChange={handlePaymentChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Payment Method"
                    error={!!errors.order_payment}
                    helperText={errors.order_payment}
                  />
                )}
              />

              <Autocomplete
                options={orderTypes}
                getOptionLabel={(option) => option.label} 
                value={orderTypes.find((orderType) => orderType.value === data.order_type) || null}
                onChange={handleOrderTypeChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Order Type"
                    error={!!errors.order_type}
                    helperText={errors.order_type}
                  />
                )}
              />

              <DateTimePicker
                label="Order Date"
                name="created_at"
                value={data?.created_at ? dayjs(data.created_at).tz('Asia/Jakarta') : null}
                onChange={handleDateChange}
                error={!!errors.created_at}
                helperText={errors.created_at}
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" style={{ backgroundColor: 'brown', color: 'white' }}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderPage;

