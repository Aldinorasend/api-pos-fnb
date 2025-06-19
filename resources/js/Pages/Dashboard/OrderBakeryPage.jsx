import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Backdrop, CircularProgress, Paper, Box, IconButton, Tooltip, Select, MenuItem } from '@mui/material'
import User from '@/Layouts/User'
import useCurrencyRupiah from '@/hooks/useCurrencyRupiah'
import { DateRangePicker } from '@mui/x-date-pickers-pro'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'
import { MaterialReactTable } from 'material-react-table'
import usePageVisibility from '@/hooks/usePageVisibility'

const OrderPage = (props) => {
  const [order, setOrder] = useState([])
  const [date, setDate] = useState([dayjs(), dayjs()])
  const [isLongPollingEnable, setIsLongPollingEnable] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const timerIdRef = useRef(null);
  const isPageVisible = usePageVisibility()

  // useEffect(() => {
  //   if (isPageVisible && isLongPollingEnable) {
  //     getData()
  //     startPolling()
  //     setIsLoading(false)
  //   }else{
  //     stopPolling()
  //   }

  //   return () => {
  //     stopPolling()
  //   }
  // }, [isPageVisible, isLongPollingEnable])

  useEffect(() => {
    getData()
    setIsLoading(false)
  }, []);

  // const pollingCallback = () => {
  //   try {
  //     getData()
  //   } catch (error) {
  //     setIsLongPollingEnable(false)
  //   }
  // }

  // const startPolling = () => {
  //   timerIdRef.current = setInterval(pollingCallback, 10000)
  // }

  // const stopPolling = () => {
  //   clearInterval(timerIdRef.current)
  // }

  const getData = async () => {
    const data = await fetch(`${props.api}api/order?search_date_start=` + date[0].toISOString() + "&search_date_end=" + date[1].toISOString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setOrder(json.data.filter((val) => JSON.parse(val.order_items).some((val) => val.category_id == 9)))
  }

  const handleDateChange = async (e) => {
    setDate(e)

    await fetch(`${props.api}api/order/bakery?search_date_start=` + e[0].toISOString() + "&search_date_end=" + e[1].toISOString(), {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
      .then((val) => val.json())
      .then((json) => { setOrder(json.data) })
      .catch((err) => Swal.fire("Error", `${err}`, "error"))
      .finally(() => {
        setIsLoading(false)
      })
  }

  const categoryPrice = () => {
    let price = 0;
    order.map((val) => JSON.parse(val.order_items)
      .filter((val) => val.category_id == 9)
      .map((val) => { price += val.menu_price * val.count }))
    price = useCurrencyRupiah(price)
    return price;
  }

  const columns = [
    {
      accessorKey: 'order_name',
      header: 'Customer Name',
      size: 100,
    },
    {
      accessorKey: 'order_cashier',
      header: 'Customer Cashier',
      size: 100,
    },
    {
      accessorKey: 'order_items',
      header: 'Items Order',
      size: 100,
      Cell: ({ cell }) => (<ul>
        {JSON.parse(cell.row.original.order_items)
          .filter((val) => val.category_id == 9)
          .map((val) => <li>{val.menu_name} x {val.count}</li>)}
      </ul>)
    },
    {
      accessorKey: 'order_total',
      header: 'Total Price',
      size: 100,
      Cell: ({ cell }) => {
        let price = 0;
        JSON.parse(cell.row.original.order_items)
          .filter((val) => val.category_id == 9)
          .map((val) => { price += val.menu_price * val.count })
        return useCurrencyRupiah(price)

      }
    },
    {
      accessorKey: 'order_payment',
      header: 'Payment Method',
      size: 100,
    },
    {
      accessorKey: 'created_at',
      header: 'Ordered',
      size: 100,
      Cell: ({ cell }) => dayjs(cell.row.original.created_at).tz("Asia/Jakarta").toDate().toLocaleString('id'),
    },
  ]

  if (isLoading) {
    return (
      <User>
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoading}>
          <CircularProgress color='inherit' />
        </Backdrop>
      </User>
    )
  }

  return (
    <User title="Riwayat Pesanan" userType={props.auth.user.role_id}>
      <Paper sx={{ width: "110%", overflow: "hidden", padding: "10px" }}>
        <p>Pilih Tanggal Pesanan Dari</p>
        <DateRangePicker value={date} onChange={handleDateChange} slotProps={{ textField: { size: 'small' } }} />
        <br /><br />
        <MaterialReactTable
          columns={columns}
          data={order}
          rowNumberMode='original'
          enableRowNumbers
        />
        <br /><br />
        <b style={{ paddingLeft: "10px" }}>Total : {categoryPrice()}
        </b>
      </Paper>
    </User >
  )
}

export default OrderPage