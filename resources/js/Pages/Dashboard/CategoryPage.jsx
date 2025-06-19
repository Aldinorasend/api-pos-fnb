import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Select,
  InputLabel,
  FormControl,
  Typography,
  FormControlLabel,
  Chip,
} from '@mui/material';
import { CheckBox, Delete, Edit } from '@mui/icons-material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import { usePage } from '@inertiajs/inertia-react';

const CategoryPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const { translations } = usePage().props;

  useEffect(() => {
    getOutletData();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      getCategoryData(selectedOutlet);
    }
  }, [selectedOutlet]);

  const getOutletData = async () => {
    const data = await fetch(`${props.api}api/outlet/current/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    const json = await data.json();
    setOutlets(json.data);
    setSelectedOutlet(json.data[0]?.id || '');
  };

  const getCategoryData = async (outletId) => {
    setIsLoading(true);
    const data = await fetch(`${props.api}api/category/outlet/${outletId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    const json = await data.json();
    setCategory(json.data);
    setIsLoading(false);
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You sure to update this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update this!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          await fetch(`${props.api}api/category/${row.original.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ category_name: `${values.category_name}` })
          })
            .then((res) => {
              Swal.fire(
                'Updated!',
                'Your file has been updated.',
                'success'
              );
            })
            .catch((err) => {
              Swal.fire(
                'Failed To Update',
                `${err}`,
                'error'
              );
            });

          getCategoryData(selectedOutlet);
        }
      });
      exitEditingMode();
    }
  };

  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  const handleDeleteRow = useCallback(
    (row) => {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const response = await fetch(`${props.api}api/category/${row.original.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
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
    
            getCategoryData(selectedOutlet);
          } catch (err) {
            Swal.fire('Failed!', `${err.message || 'An error occurred.'}`, 'error');
          }
        }
      });
    },
    [selectedOutlet],
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid = validateRequired(event.target.value);
          if (!isValid) {
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`,
            });
          } else {
            delete validationErrors[cell.id];
            setValidationErrors({
              ...validationErrors,
            });
          }
        },
      };
    },
    [validationErrors],
  );

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
        accessorKey: 'category_name',
        header: 'Category',
        size: 150,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "text"
        }),
      },
      {
        accessorKey: 'is_food',
        header: 'Food',
        size: 800,
        enableEditing: true,
        Cell: ({ cell }) => {
          const isFood = cell.getValue() === 1;
          return (
            <Chip size='small' label={isFood ? 'Yes' : 'No'} color={isFood ? 'success' : 'error'} />
          );
        }
      },
    ],
    [getCommonEditTextFieldProps],
  );

  // if (isLoading) {
  //   return null; // Menghilangkan tampilan loading
  // }

  return (
    <User title={translations.category} userType={props.auth.user.role_id}>
      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Outlet</Typography> {/* Label di luar dropdown */}
      <FormControl variant="outlined" sx={{ mb: 2, width: '200px' }} size="small"> {/* Menyesuaikan lebar dropdown */}
        <Select
          id="outlet-select"
          value={selectedOutlet}
          onChange={(e) => setSelectedOutlet(e.target.value)}
          sx={{ backgroundColor: 'white' }}
        >
          {outlets.map((outlet) => (
            <MenuItem key={outlet.id} value={outlet.id}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                  <StorefrontIcon sx={{ mr:1 }}/>
                  <div>{outlet.outlet_name}</div>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'center',
            },
            size: 30
          },
        }}
        columns={columns}
        data={category}
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={handleCancelRowEdits}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton onClick={() => table.setEditingRow(row)}>
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
          >{translations.create_category}</Button>
        )}
      />
      <CreateNewCategoryModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={() => getCategoryData(selectedOutlet)}
        category={category}
        api={props.api}
        selectedOutlet={selectedOutlet}
      />
    </User>
  );
};

export const CreateNewCategoryModal = ({ open, columns, onClose, onSubmit, category, api, selectedOutlet }) => {
  const [selectCategory, setSelectCategory] = useState("");
  const [isFood, setIsFood] = useState(false);
  const { translations } = usePage().props;

  const handleSubmit = async () => {
    await fetch(`${api}api/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        category_name: `${selectCategory}`,
        is_food: isFood,
        outlet_id: selectedOutlet,
      })
    })
      .then(response => {
        Swal.fire(
          "Created!",
          "Success on creating new category",
          "success"
        );
      })
      .catch(response => {
        Swal.fire(
          "Failed",
          `${response}`,
          "error"
        );
      });
    onSubmit();
    onClose();
  };

  const handleChange = (event) => {
    setSelectCategory(event.target.value);
  };

  const handleisFoodChange = (event) => {
    setIsFood(event.target.checked);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">{translations.create_category}</DialogTitle>
      <DialogContent>
        <FormControl onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '260px', md: '500px' },
              gap: '1 rem',
            }}
          >
            <TextField
              label="Category Name"
              name="category"
              onChange={handleChange}
            />

            <Typography
              variant="h8"
              sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px", marginTop: '1rem' }}
            >
              ADDITIONAL INFORMATION
            </Typography>
            <Box sx={{ px: 2 }}> 
              <FormControlLabel
                key={1}
                control={<Checkbox checked={isFood} onChange={handleisFoodChange} />}
                label={<Typography sx={{ fontWeight: 'bold' }}>FOOD</Typography>}
              />
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

const validateRequired = (value) => !!value.length;

export default CategoryPage;