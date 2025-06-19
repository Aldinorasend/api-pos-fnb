import { useState, useEffect, useMemo } from 'react';
import { Backdrop, CircularProgress, Paper, Box, Select, MenuItem, Typography, TextField, FormControl, useTheme } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import { MaterialReactTable } from 'material-react-table';
import StorefrontIcon from '@mui/icons-material/Storefront';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { usePage } from '@inertiajs/inertia-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

dayjs.extend(utc);
dayjs.extend(timezone);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StatisticsPage = (props) => {
  const [productSold, setProductSold] = useState([]);
  const [busyHours, setBusyHours] = useState([]);
  const [startDate, setStartDate] = useState(dayjs().tz('Asia/Jakarta'));
  const [endDate, setEndDate] = useState(dayjs().tz('Asia/Jakarta'));
  const [outlet, setOutlet] = useState('');
  const [outlets, setOutlets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { translations } = usePage().props;
  const theme = useTheme();

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
      // Fetch product orders
      const start = startDate.tz('Asia/Jakarta').format('YYYY-MM-DD');
      const end = endDate.tz('Asia/Jakarta').format('YYYY-MM-DD');
      
      const data = await fetch(`${props.api}api/order/sold/outlet/${selectedOutlet}?start_date=${start}&end_date=${end}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });

      const json = await data.json();

      if (json.status === "success") {
        setProductSold(json.data || []);
      } else {
        Swal.fire('Error', 'Failed to load orders', 'error');
      }

      // Fetch busy hours
      const busyHoursData = await fetch(`${props.api}api/order/busy-hours/outlet/${selectedOutlet}?start_date=${start}&end_date=${end}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });

      const busyHoursJson = await busyHoursData.json();

      if (busyHoursJson.status === "success") {
        setBusyHours(busyHoursJson.data || []);
      } else {
        Swal.fire('Error', 'Failed to load busy hours', 'error');
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

  const columns = useMemo(() => [
    {
      accessorKey: 'product',
      header: 'Product Name',
      size: 150,
    },
    {
      accessorKey: 'total_sold',
      header: 'Total Sold',
      size: 150,
    },
  ], []);

  // Chart data for busy hours
  const chartData = {
    labels: busyHours.map(hour => hour.hour), // Hour labels
    datasets: [
      {
        label: 'Total Transactions',
        data: busyHours.map(hour => hour.total_transactions), // Total transactions for each hour
        backgroundColor: theme.palette.primary.main, // Bar color
        borderColor: theme.palette.primary.main,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Busy Hours',
      },
    },
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
    <User title={translations.statistics} userType={props.auth.user.role_id}>
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
      <Paper sx={{ width: "100%", overflow: "hidden", padding: "20px", display: 'flex', gap: 2 }}>
        <Box sx={{ width: "50%" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Products Sold</Typography>
          <MaterialReactTable
            columns={columns}
            data={productSold}
            enableRowNumbers
            initialState={{
              density: 'compact',
            }}
          />
        </Box>
        <Box sx={{ width: "50%" }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Busy Hours</Typography>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Paper>  
    </User>
  );
};


export default StatisticsPage;

