import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  CircularProgress,
  FormControl,
  MenuItem,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { CheckBox, Delete, Edit } from '@mui/icons-material';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs'
import NumberFormatCustom from "../../Components/NumberFormatCustom";
import PercentFormatCustom from "../../Components/PercentFormatCustom";
import { usePage } from '@inertiajs/inertia-react';

const DiscountPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [outletOptions, setOutletOptions] = useState([]);
  const { translations } = usePage().props;

  useEffect(() => {
    getDiscountData()
    getOutletData()
    setIsLoading(false);
  }, []);

  const getDiscountData = async () => {
    const response = await fetch(`${props.api}api/discount`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    const json = await response.json();
    setData(json.data);
  };

  const getOutletData = async () => {
    try {
      const url = props.auth.user.role_id === 1 ? `${props.api}api/outlet` : `${props.api}api/outlet/current/user`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      const json = await response.json();
      setOutletOptions(json.data);
    } catch (error) {
      console.error('Error fetching outlet data:', error);
    }
  };

  const handleDeleteRow = useCallback(
    async (row) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      });
  
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${props.api}api/discount/${row.original.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
          });
  
          const responseData = await response.json();
  
          if (response.ok) {
            Swal.fire('Deleted!', responseData.message || 'Discount has been deleted.', 'success');
          } else {
            Swal.fire('Failed!', responseData.message || 'Something went wrong.', 'error');
          }
  
          getDiscountData();
        } catch (err) {
          Swal.fire('Failed!', `${err.message || 'An error occurred.'}`, 'error');
        }
      }
    },
    [data, props.api]
  );

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        enableColumnOrdering: false,
        enableEditing: false, //disable editing on this column
        enableSorting: false,
        size: 80,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 140,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        size: 140,
        Cell: ({ cell }) => cell.getValue() === 'percent' ? 'Percent (%)' : 'Fixed Price',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 140,
        Cell: ({ cell, row }) => {
          const type = row.original.type;
          const amount = cell.getValue();
          return type === 'percent' ? `${amount}%` : `Rp ${amount.toLocaleString('id-ID')}`;
        },
      },
      {
        accessorKey: "outlets",
        header: "Outlet",
        size: 140,
        Cell: ({ cell }) => {
            const selectedOutletIds = cell.getValue() || [];
            return (
                <div>
                    {selectedOutletIds
                        .map((outlet) => {
                            return outlet
                                ? outlet.outlet_name
                                : "Unknown";
                        })
                        .join(", ")}
                </div>
            );
        },
    },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 140,
        enableEditing: false,
        Cell: ({ cell }) => dayjs(cell.row.original.created_at).tz("Asia/Jakarta").toDate().toLocaleString('id')
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <User title={translations.discount} userType={props.auth.user.role_id}>
      <MaterialReactTable
        initialState={{ columnVisibility: { id: false } }}
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 120,
          },
        }}
        columns={columns}
        data={data}
        enableColumnOrdering
        enableEditing
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton
                onClick={() => {
                  setEditingRow(row.original);
                  setEditModalOpen(true);
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Button 
            color="primary" 
            variant="contained" 
            onClick={()=>setCreateModalOpen(true)} 
          >{translations.create_discount}</Button>
        )}
      />
      <CreateNewDiscountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={getDiscountData}
        outletOptions={outletOptions}
        api={props.api}
      />
      <EditDiscountModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={getDiscountData}
        data={editingRow}
        outletOptions={outletOptions}
        setData={setEditingRow}
        api={props.api}
      />
    </User>
  );
};

export const CreateNewDiscountModal = ({ open, onClose, onSubmit, outletOptions, api }) => {
  const { translations } = usePage().props;
  const [formValues, setFormValues] = useState({
    name: "",
    type: "",
    amount: "",
    outlets: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch(`${api}api/discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: formValues.name,
          type: formValues.type,
          amount: formValues.amount,
          outlet_ids: formValues.outlets,
        }),
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

        setFormValues({
          name: "",
          type: "",
          amount: "",
          outlets: []
        });

        onSubmit();
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };

  const handleOutletChange = (outletId) => {
    setFormValues((prevFormValues) => {
        const updatedOutlets = prevFormValues.outlets.includes(outletId)
            ? prevFormValues.outlets.filter((id) => id !== outletId)
            : [...prevFormValues.outlets, outletId];
        return {
            ...prevFormValues,
            outlets: updatedOutlets,
        };
    });
};

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center" variant='h5' fontWeight={600}>{translations.create_discount}</DialogTitle>
      <DialogContent>
        <FormControl onSubmit={(e) => e.preventDefault()}>
        <Stack
          sx={{
            width: '100%',
            minWidth: { xs: '300px', sm: '260px', md: '450px' },
            gap: '1 rem',
          }}
        >
          <Typography
            variant="h8"
            sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
          >
            GENERAL INFORMATION
          </Typography>
          <Box sx={{ px: 2 , py: 2.5}}>
            <TextField
              label="Name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Type"
              name="type"
              value={formValues.type}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.type}
              helperText={errors.type}
              sx={{ mb: 2 }}
            >
              <MenuItem key="percent" value="percent">Percent (%)</MenuItem>
              <MenuItem key="fixed" value="fixed">Fixed Price</MenuItem>
            </TextField>
            <TextField
              label="Amount"
              name="amount"
              type="text"
              value={formValues.amount}
              onChange={handleChange}
              fullWidth
              error={!!errors.amount}
              helperText={errors.amount}
              sx={{ mb: 2 }}
              InputProps={{
                inputComponent: formValues.type === 'percent' ? PercentFormatCustom : NumberFormatCustom,
              }}
            />
          </Box>
            <Typography
            variant="h8"
            sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
          >
            ASSIGN OUTLET
          </Typography>
          <Box sx={{ px: 2 }}> 
          <FormGroup>
          {outletOptions.map((outlet) => (
                <FormControlLabel
                  key={outlet.id}
                  control={
                    <Checkbox
                      checked={formValues.outlets.includes(outlet.id)}
                      onChange={() => handleOutletChange(outlet.id)}
                    />
                  }
                  label={<Typography sx={{ fontWeight: 'bold' }}>{outlet.outlet_name}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
          </Stack>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
      </DialogActions>
    </Dialog>
  );
};

export const EditDiscountModal = ({ open, onClose, onSubmit, data, setData, outletOptions, api }) => {
  const [errors, setErrors] = useState({});
  const { translations } = usePage().props;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const arr1 = []
        const arr = data.outlets.map((item) => (
            arr1.push(item.id)
       ))
        const dataOutlet = {
            name: data.name,
            type: data.type,
            amount: data.amount,
            outlet_ids: arr1, 
          };

    try {
      const response = await fetch(`${api}api/discount/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataOutlet),
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

        onSubmit(data);
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };

  const handleOutletChange = (outletId, isi) => { 
    setData((prevFormValues) => {
        const updatedOutlets = prevFormValues.outlets.some(outlet => outlet.id === outletId)
            ? prevFormValues.outlets.filter((outlet) => outlet.id !== outletId)
            : [...prevFormValues.outlets, isi];

        return {
            ...prevFormValues,
            outlets: updatedOutlets,
        };
    });
};

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center" variant='h5' fontWeight={600}>{translations.edit_discount}</DialogTitle>
      <DialogContent>
        <FormControl onSubmit={(e) => e.preventDefault()}>
        <Stack
          sx={{
            width: '100%',
            minWidth: { xs: '300px', sm: '260px', md: '450px' },
            gap: '1 rem',
          }}
        >
            <Typography
            variant="h8"
            sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
          >
            GENERAL INFORMATION
          </Typography>
          <Box sx={{ px: 2 , py: 2.5}}>
            <TextField
              label="Name"
              name="name"
              value={data?.name || ''}
              onChange={handleChange}
              fullWidth
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              select
              label="Type"
              name="type"
              value={data?.type || ''}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.type}
              helperText={errors.type}
              sx={{ mb: 2 }}
            >
              <MenuItem key="percent" value="percent">Percent (%)</MenuItem>
              <MenuItem key="fixed" value="fixed">Fixed Price</MenuItem>
            </TextField>
            <TextField
              label="Amount"
              name="amount"
              type="text"
              value={data?.amount || ''}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                inputComponent: data?.type === 'percent' ? PercentFormatCustom : NumberFormatCustom,
              }}
            />
            </Box>
            <Typography
            variant="h8"
            sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
          >
            ASSIGN OUTLET
          </Typography>
          <Box sx={{ px: 2 }}> 
          <FormGroup>
              {outletOptions.map((item) => (
                <FormControlLabel
                  key={item.id}
                  control={
                    <Checkbox
                    checked={data?.outlets.some(outlet => outlet.id === item.id)}
                    onChange={() =>handleOutletChange(item.id, item)}
                    />
                  }
                  label={<Typography sx={{ fontWeight: 'bold' }}>{item.outlet_name}</Typography>}
                />
              ))}
            </FormGroup>
          </Box>
          </Stack>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiscountPage;