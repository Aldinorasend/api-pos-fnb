import React, { useState, useEffect, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Checkbox,
  Chip,
  Switch,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react';

const ManageUserPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [outletOptions, setOutletOptions] = useState([]);
  const { translations } = usePage().props;

  useEffect(() => {
    getUserData();
    getUserTypeData();
    getOutletData();
  }, []);

  const getUserData = async () => {
    try {
      const url = props.auth.user.role_id === 1 ? `${props.api}api/user` : `${props.api}api/user/outlet`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      const json = await response.json();
      const dataWithOutlets = json.data.map(user => ({
        ...user,
        outlets: user.outlets.map(outlet => outlet.id) || [],
      }));
      setData(dataWithOutlets);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsLoading(false);
    }
  };  

  const getUserTypeData = async () => {
    try {
      const response = await fetch(`${props.api}api/roles`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      const json = await response.json();
      setRoles(json.data);
    } catch (error) {
      console.error('Error fetching user type data:', error);
    }
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
  
  
  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    setEditingUser({
      ...row.original,
      name: values.name,
      email: values.email,
      role_id: values.role,
      outlets: values.outlets,
    });
    setEditModalOpen(true);
    exitEditingMode();
  };

  const handleDeleteRow = async (row) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`${props.api}api/user/${row.original.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${window.localStorage.getItem('token')}`,
            },
          });
      
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 409) {
              Swal.fire("Failed", `${errorData.message}`, "error");
            } else {
              throw new Error(errorData.message || 'An error occurred');
            }
          } else {
            const data = await response.json();
            Swal.fire("Success", `${data.message}`, "success");
          }

          getUserData();
        } catch (error) {
          Swal.fire("Failed!", error.message, "error");
        }
      }
    });
  };

  const columns = useMemo(
    () => [
      // {
      //   accessorKey: 'id',
      //   header: 'ID',
      //   enableColumnOrdering: false,
      //   enableEditing: false,
      //   enableSorting: false,
      //   size: 80,
      // },
      {
        accessorKey: 'name',
        header: 'Name',
        size: 140,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        size: 140,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        size: 140,
      },
      {
        accessorKey: 'outlets',
        header: 'Outlets',
        size: 200,
        Cell: ({ cell }) => {
          const selectedOutletIds = cell.getValue() || [];
          return (
            <div>
              {selectedOutletIds
                .map((outletId) => {
                  const outlet = outletOptions.find((o) => o.id === outletId);
                  return outlet ? outlet.outlet_name : 'Unknown';
                })
                .join(', ')}
            </div>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 100,
        enableEditing: false,
        Cell: ({ cell }) => {
          const isActive = cell.getValue() === 1;
          return (
            <Chip size='small' label={isActive ? 'Active' : 'Inactive'} color={isActive ? 'success' : 'error'}/>
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
    [roles, outletOptions],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <User title={translations.user} userType={props.auth.user.role_id}>
      <MaterialReactTable
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
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={() => setValidationErrors({})}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton onClick={() => {
                setEditingRow(row.original);
                setEditModalOpen(true);
              }}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Delete">
              <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip arrow placement="right" title="Status">
              <Switch
                checked={Boolean(row.original.is_active)}
                inputProps={{ "aria-label": "controlled" }} 
                onChange={async (e) => {
                  await fetch(`${props.api}api/user/${row.original.id}/status`, {
                    method: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                      "Accept": "application/json",
                      "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      is_active: e.target.checked
                    })
                  })
                    .then((val) => val.json())
                    .then((json) => {getUserData()})
                    .catch((err) => Swal.fire(
                      "Failed",
                      `${err}`,
                      "error"
                    ))
                }} 
              />
            </Tooltip>
          </Box>
        )}
        renderTopToolbarCustomActions={() => (
          <Button 
            color="primary" 
            variant="contained" 
            onClick={()=>setCreateModalOpen(true)} 
          >{translations.create_user}</Button>
        )}
      />

      <CreateNewAccountModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={getUserData}
        roles={roles}
        outletOptions={outletOptions}
        api={props.api}
      />

      <EditUserModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={getUserData}
        data={editingRow}
        setData={setEditingRow}
        roles={roles}
        outletOptions={outletOptions}
        api={props.api}
      />
    </User>
  );
};

const CreateNewAccountModal = ({ open, onClose, onSubmit, roles, outletOptions, api }) => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    outlets: [],
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { translations } = usePage().props;

  const handleSubmit = async () => {
    setErrors({});

    try {
      const userPayload = {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        role_id: formValues.role,
        outlets_id: formValues.outlets,
      };
  
      const response = await fetch(`${api}api/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userPayload),
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
          email: "",
          password: "",
          role: "",
          outlets: []
        });

        onSubmit();
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };  

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center"
      variant='h5'
      fontWeight={600}>{translations.create_user}</DialogTitle>
      <DialogContent>
        <Stack
          sx={{
            width: '100%',
            minWidth: { xs: '300px', sm: '260px', md: '500px' },
            gap: '1 rem',
          }}
        >
          <Typography
            variant="h8"
            sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
          >
            GENERAL INFORMATION
          </Typography>
          <Box sx={{ px: 2 , py: 1.5}}>
            <TextField
              label="Name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Email"
              name="email"
              value={formValues.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formValues.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password}
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleShowPassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Role"
              name="role"
              value={formValues.role}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              error={!!errors.role_id}
              helperText={errors.role_id}
              sx={{ mb: 2 }}
            >
              {roles.map((val) => (
                <MenuItem key={val.value} value={val.value}>
                  {val.label}
                </MenuItem>
              ))}
            </TextField>
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
            {!!errors.outlets_id && (
              <FormHelperText error>{errors.outlets_id}</FormHelperText>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
      </DialogActions>
    </Dialog>
  );
};

const EditUserModal = ({ open, onClose, data, setData, roles, outletOptions, api, onSubmit }) => {
  const [errors, setErrors] = useState({});
  const { translations } = usePage().props;

  const handleSubmit = async () => {
    try {
      const userPayload = {
        name: data.name,
        email: data.email,
        role_id: data.role_id,
        outlets_id: data.outlets, 
      };
      
      const response = await fetch(`${api}api/user/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: JSON.stringify(userPayload),
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
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleOutletChange = (outletId) => {
    setData((prevFormValues) => {
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
      <DialogTitle textAlign="center"
      variant='h5'
      fontWeight={600}>{translations.edit_user}</DialogTitle>
      <DialogContent>
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
              fullWidth 
              onChange={handleChange} 
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 2 }}
            />
            <TextField 
              label="Email" 
              type="email" 
              name="email"
              value={data?.email || ''}
              fullWidth 
              onChange={handleChange} 
              error={!!errors.email}
              helperText={errors.email}
              sx={{ mb: 2 }}
            />
            <TextField 
              select 
              label="Role" 
              name="role_id"
              value={data?.role_id || ''}
              fullWidth 
              onChange={handleChange} 
              error={!!errors.role_id}
              helperText={errors.role_id}
              sx={{ mb: 2 }}
            >
              {roles.map((val) => (
                <MenuItem key={val.value} value={val.value}>
                  {val.label}
                </MenuItem>
              ))}
            </TextField>
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
                      checked={data?.outlets.includes(outlet.id)}
                      onChange={() => handleOutletChange(outlet.id)}
                    />
                  }
                  label={<Typography sx={{ fontWeight: 'bold' }}>{outlet.outlet_name}</Typography>}
                  />
              ))}
            </FormGroup>
            {!!errors.outlets_id && (
              <FormHelperText error>{errors.outlets_id}</FormHelperText>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: '1.25rem' }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
      </DialogActions>
    </Dialog>         

  );
};

export default ManageUserPage;