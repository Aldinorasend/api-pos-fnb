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
  FormControl,
  Select,
  InputBase,
  ButtonBase,
  Radio,
  RadioGroup,
  Grid,
} from '@mui/material';
import { blue, red } from "@mui/material/colors";
import { Delete, Edit , Check, Store} from '@mui/icons-material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import Clear from "@mui/icons-material/Clear";

import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react';

const ModifierPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [openApplySetProductModal, setOpenApplySetProductModal] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState([]);

  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [outlets, setOutlets] = useState([])

  const [editingModifier, setEditingModifier] = useState(null);
  const [modifierOptions, setModifierOptions] = useState([]);

  const [menuData, setMenuData] = useState([]);
  const [selectedMenus, setSelectedMenus] = useState({});
  const [selectedModifierForApply, setSelectedModifierForApply] = useState(null);
  const { translations } = usePage().props;


  useEffect(() => {
    getOutletData();
    getModifierData();
  }, []);

  useEffect(() => {
    if (selectedOutlet) {
      getMenuData(selectedOutlet);
    }
  }, [selectedOutlet]);

  const getOutletData = async () => {
    try {
      const data = await fetch(`${props.api}api/outlet/current/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      const json = await data.json();
      setOutlets(json.data);
      setSelectedOutlet(json.data[0]?.id || '');
    } catch (error) {
      console.error('Error fetching outlet data:', error);
    }
  };

  const getMenuData = async (outletId) => {
    try {
      const response = await fetch(`${props.api}api/product/ext/outlet/${outletId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      const json = await response.json();
      setMenuData(json.data || []);

      const initialSelectedMenus = {};
      (json.data.menus || []).forEach((menu) => {
        initialSelectedMenus[menu.id] = false;
      });
      setSelectedMenus(initialSelectedMenus);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    }
  };

  const handleApplySetProduct = (modifier) => {
    setSelectedModifierForApply(modifier);
    setOpenApplySetProductModal(true);
  };
  
  const getModifierData = async () => {
    try {
      const response = await fetch(`${props.api}api/modifier`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Error fetching modifiers: ${response.statusText}`);
      }
      const data = await response.json();
      setTableData(data.data);

      const options = data.data.flatMap(modifier => modifier.modifier_options || []);
      setModifierOptions(options);

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching modifiers:', error);
      setIsLoading(false); 
    }
  };

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    setEditingUser({
      ...row.original,
      name: values.name,
      is_required: values.is_required,
      min_selected: values.min_selected,
      max_selected: values.max_selected,
      outlet_id: selectedOutlet,
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
          const response = await fetch(`${props.api}api/modifier/${row.original.id}`, {
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
  
          getModifierData();
        } catch (err) {
          Swal.fire('Failed!', `${err.message || 'An error occurred.'}`, 'error');
        }
      }
    });
  };

  const handleCreateModifierSubmit = async () => {
    getModifierData();
    setCreateModalOpen(false);
  };

  
  const handleEditModifierSubmit = async () => {
    setEditingModifier(null);
    setEditModalOpen(false);
    getModifierData();
  };

  const getCommonEditTextFieldProps = (cell) => {
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
          const { [cell.id]: omit, ...rest } = validationErrors;
          setValidationErrors(rest);
        }
      },
    };
  };

  const validateRequired = (value) => {
    return value.length > 0;
  };

  const handleOutletChange = (event) => {
    const newSelectedOutlet = event.target.value;
    setSelectedOutlet(newSelectedOutlet);
  };

  const filteredModifiers = tableData.filter(modifier => {
    return String(modifier.outlet_id) === String(selectedOutlet);
  });
  
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Modifier Set Name',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: 'text',
        }),
      },
      {
        accessorKey: 'modifier_options',
        header: 'Options',
        size: 140,
        Cell: ({ cell }) => {
          const selectedModifiers = cell.getValue() || [];
      
          return (
            <div>
              {selectedModifiers
                .map((modifier) => modifier.name || 'Unknown')
                .join(', ')}
            </div>
          );
        },
      },
  
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 140,
        enableEditing: false,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "date"
        }),
        Cell: ({ cell }) => dayjs(cell.row.original.created_at).tz("Asia/Jakarta").toDate().toLocaleString('id')
      },
    ],
    [category, getCommonEditTextFieldProps],
  );

  

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <User title={translations.modifier} userType={props.auth.user.role_id}>
      <Typography sx={{ mx: 0, fontWeight: 'bold'}}>Outlet</Typography>
      <FormControl sx={{ mx: 0, mb: 2, width: 200, bgcolor: "white" }} size="small">
        <Select
          value={selectedOutlet}
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
      <MaterialReactTable
        displayColumnDefOptions={{
          'mrt-row-actions': {
            muiTableHeadCellProps: {
              align: 'left',
              sx: {
                paddingX: 10,
              },
            },  
            size: 120,
          },
        }}
        columns={columns}
        data={filteredModifiers}
        editingMode="modal"
        enableColumnOrdering
        enableEditing
        onEditingRowSave={handleSaveRowEdits}
        onEditingRowCancel={() => setValidationErrors({})}
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip arrow placement="left" title="Edit">
              <IconButton onClick={() => {
                setEditingModifier(row.original);
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
            <Tooltip arrow placement="top" title="Apply Set Product">
              <Button
                variant="outlined"
                sx={{
                  color: 'black',
                  borderColor: 'black',
                  '&:hover': {
                    borderColor: 'black',
                  },
                  marginX: 10,
                }}
                onClick={() => handleApplySetProduct(row.original)}
              >
                APPLY SET PRODUCT
              </Button>
              
            </Tooltip>
          </Box>
          
        )}
        renderTopToolbarCustomActions={() => (
          <Button 
            color="primary" 
            variant="contained" 
            onClick={()=>setCreateModalOpen(true)} 
          >{translations.create_modifier}</Button>
        )}
      />
      <ApplySetProductModal
        open={openApplySetProductModal}
        onClose={() => setOpenApplySetProductModal(false)}
        menuItems={menuData}
        selectedItems={selectedMenus}
        setSelectedItems={setSelectedMenus}
        selectedModifier={selectedModifierForApply}
        props={props}
      />

      <CreateNewModifierModal
        open= {createModalOpen}
        onClose= {() => setCreateModalOpen(false)}
        onSubmit= {handleCreateModifierSubmit}
        outletId = {selectedOutlet}
        api= {props.api}
      />

      {editingModifier && (
        <EditModifierModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          modifier={editingModifier}
          onSubmit={handleEditModifierSubmit}
          outletId = {selectedOutlet}
          api= {props.api}
        />
      )}
    </User>
  );
};

const ModifierModal = ({ open, onClose, onSubmit, outletId, api, modifier }) => {
  const isEditMode = !!modifier;

  const [name, setName] = useState('');
  const [modifierOptions, setModifierOptions] = useState([{ name: '', price: '' }]);
  const [isRequired, setIsRequired] = useState(false);
  const [minSelected, setMinSelected] = useState(1);
  const [maxSelected, setMaxSelected] = useState(1);
  const [modifierId, setModifierId] = useState('');
  const { translations } = usePage().props;

  useEffect(() => {
    if (open && !isEditMode) {
      setName('');
      setModifierOptions([{ name: '', price: '' }]);
      setIsRequired(false);
      setMinSelected(1);
      setMaxSelected(1);
      setModifierId('');
    }
    if (modifier && isEditMode) {
      setName(modifier.name || '');
      setIsRequired(modifier.is_required === 1);
      setMinSelected(modifier.min_selected || 1);
      setMaxSelected(modifier.max_selected || 1);
      setModifierId(modifier.outlet_id || null);
      setModifierOptions(modifier.modifier_options || [{ name: '', price: '' }]);
    }
  }, [open, isEditMode, modifier]);

  const handleUpdateOption = (e, index) => {
    const { name, value } = e.target;
    const updatedOptions = [...modifierOptions];
    updatedOptions[index][name] = value;
    setModifierOptions(updatedOptions);
    setMaxSelected(updatedOptions.length);
    if (minSelected > updatedOptions.length) {
      setMinSelected(updatedOptions.length);
    }
  };

  const handlePriceChange = (e, index) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    if (value >= 0) {
      const newOptions = [...modifierOptions];
      newOptions[index].price = value;
      setModifierOptions(newOptions);
    }
  };

  const handleAddVariant = () => {
    setModifierOptions([...modifierOptions, { name: '', price: '' }]);
    setMaxSelected(modifierOptions.length + 1);
  };

  const handleDeleteRow = (index) => {
    const updatedOptions = modifierOptions.filter((_, i) => i !== index);
    setModifierOptions(updatedOptions);
    setMaxSelected(updatedOptions.length);
    if (minSelected > updatedOptions.length) {
      setMinSelected(updatedOptions.length);
    }
  };

  const handleSubmit = async () => {
    try {
      const modifierPayload = {
        name:name,
        is_required: isRequired ? 1 : 0,
        min_selected: minSelected,
        max_selected: maxSelected,
        outlet_id:  outletId,
        modifier_options: modifierOptions.map(option => ({
          ...option,
          price: parseFloat(option.price)
        })),
      };
      
      const url = isEditMode
        ? `${api}api/modifier/${modifier.id}`
        : `${api}api/modifier`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('token')}`,
        },
        body: JSON.stringify(modifierPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error:', errorData);
        throw new Error(`Error: ${response.statusText}`);
      }

      Swal.fire('Success', `Modifier ${isEditMode ? 'updated' : 'created'} successfully`, 'success');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error creating modifier:', error);
      Swal.fire({
        title: 'Failed!',
        text: `Failed to ${isEditMode ? 'update' : 'create'} modifier`,
        icon: 'error',
        customClass: {
          container: 'swal2-container'
        }
      });
    }
  };

  const formatPrice = (value) => {
    if (!value) return 'Rp. 0';
    const number = parseFloat(value).toFixed(0);
    return `Rp. ${number}`;
  };

  return (
        <Dialog open={open} onClose={onClose}>
          <DialogTitle textAlign="center"
            variant='h5'
            fontWeight={600}>
            {isEditMode ? translations.edit_modifier : translations.create_modifier}
          </DialogTitle>
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
                MODIFIER GROUP
              </Typography>
              <Box sx={{ px: 2 , py: 2}}>
                <TextField
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    style: {
                      fontWeight: '600',
                      fontFamily: 'Nunito, sans-serif', 
                    },
                  }}
                />
              </Box>
              <Typography
                variant="h8"
                sx={{ borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
              >
                MODIFIER OPTION
              </Typography>
              <Box sx={{ px: 2, py: 1.5 }}>
                <Box sx={{ border: 1, borderColor: '#D6D4D4', borderRadius: 2, overflow: 'hidden' }}>
                  <Stack>
                    {modifierOptions.map((option, i) => (
                      <Stack key={i} direction="row">
                        <InputBase
                          sx={{ p: 1, borderBottom: 1, borderColor: '#D6D4D4', flexGrow: 1, fontWeight: '600', Family: 'Nunito, sans-serif'}}
                          name="name"
                          placeholder="Option Name"
                          value={option.name}
                          onChange={(e) => handleUpdateOption(e, i)}
                          
                        />
                        <Stack direction="row" sx={{ p: 1, borderBottom: 1, borderLeft: 1, borderColor: '#D6D4D4', flexGrow: 1, alignItems: 'center', Family: 'Nunito, sans-serif'}}>
                          <InputBase
                            sx={{ flexGrow: 1,
                              color: option.price === '' ? '#7C7878' : 'inherit',
                              fontWeight: '600',
                              Family: 'Nunito, sans-serif'
                            }}
                            name="price"
                            placeholder="Price"
                            value={formatPrice(option.price)}
                            onChange={(e) => handlePriceChange(e, i)}
                          />
                          {modifierOptions.length > 1 && (
                            <ButtonBase
                              sx={{ p: 1, width: '20px', height: '20px', borderRadius: '20px', bgcolor: red[500] }}
                              onClick={() => handleDeleteRow(i)}
                            >
                              <Clear sx={{ width: '16px', color: 'white' }} />
                            </ButtonBase>
                          )}
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                  <ButtonBase sx={{ bgcolor: blue[700], width: '100%', p: 1 }} onClick={handleAddVariant}>
                    <Typography variants = "caption" sx={{ color: 'white', fontSize: '0.75rem' }}>ADD MODIFIER OPTION</Typography>
                  </ButtonBase>
                </Box>
              </Box>
              <Typography
                variant="h8"
                sx={{ mt:2,borderBottom: '3px solid #E4E4E4', color: '#7C7C7C', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}
              >
                MODIFIER LIMIT
              </Typography>
              <Box sx={{ px: 2 ,paddingTop:2}}>
                <Stack direction="row" alignItems="flex-start" spacing={7}>
                  <Typography variant="h8" sx={{ fontWeight: 800 , py:1}}>
                    REQUIRED?
                  </Typography>
                  <RadioGroup
                    row
                    value={isRequired ? 'yes' : 'no'}
                    onChange={(e) => setIsRequired(e.target.value === 'yes')}
                  >
                    <Grid container spacing={2}>
                      <Grid item>
                        <FormControlLabel
                          value="no"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h8" sx={{fontWeight: 800,mb:0,paddingBottom:0}}>
                                No
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#7C7C7C' ,mt:-1,paddingTop:0}}>
                                Modifier is optional
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                      <Grid item>
                        <FormControlLabel
                          value="yes"
                          control={<Radio />}
                          label={
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="h8" sx={{fontWeight: 800,mb:0,paddingBottom:0}}>
                                Yes
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#7C7C7C' ,mt:-1,paddingTop:0}}>
                                Modifier selection is required
                              </Typography>
                            </Box>
                          }
                        />
                      </Grid>
                      <Grid item>
                        <Box sx={{ borderBottom: '3px solid #E4E4E4', mt: 1, mb: 0.25 }} />
                        
                        {modifierOptions.length > 1 && (
                        <Grid sx={{marginY: 0.25}} container spacing={2} alignItems="center">
                          <Grid item xs={8}>
                            <Typography variant="h8" sx={{ pl: 1 , color: '#9B9B9B', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}>
                              Min. number of modifier selected
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              type="number"
                              value={minSelected}
                              size="small"
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= 0 && value <= modifierOptions.length) {
                                  setMinSelected(value);
                                }
                              }}
                              required
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                        )}
                        <Grid sx={{marginY: 0.25}} container spacing={2} alignItems="center">
                          <Grid item xs={8}>
                            <Typography variant="h8" sx={{ pl: 1, color: '#9B9B9B', fontFamily: 'Nunito, sans-serif' , fontWeight: 800 , fontSize:"14px"}}>
                              Max. number of modifier selected
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <TextField
                              type="number"
                              value={maxSelected}
                              size="small"
                              onChange={(e) => {
                                const value = Number(e.target.value);
                                if (value >= minSelected && value <= modifierOptions.length) {
                                  setMaxSelected(value);
                                }
                              }}
                              required
                              InputLabelProps={{ shrink: true }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </RadioGroup>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 ,pr: 5,pt:2}}>
            {/* <Button onClick={onClose}>Cancel</Button>
            <Button           
            style={{ backgroundColor: 'brown', color: 'white' }}
            onClick={handleSubmit} 
            variant="contained"
            sx={{ ml: 2, width: '120px' }}>
              Save
            </Button> */}
            <Button onClick={onClose}>{translations.cancel}</Button>
            <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
          </DialogActions>
        </Dialog>
      );
};

const CreateNewModifierModal = (props) => {
  return <ModifierModal {...props} />;
};

const EditModifierModal = (props) => {
  return <ModifierModal {...props} />;
};

const ApplySetProductModal = ({open, onClose, menuItems , selectedItems, setSelectedItems, selectedModifier, props}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);

  useEffect(() => {
    setFilteredMenuItems(menuItems);
  }, [menuItems]);

  useEffect(() => {
    if (selectedModifier) {
      fetch(`${props.api}api/modifier/ext/product/${selectedModifier.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`, 
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(data => {
        const assignedProducts = data.data.products;
        const selected = {};
    
        assignedProducts.forEach(product => {
          selected[product.id] = product.is_assigned;
        });
    
        setSelectedItems(selected);
      })
      .catch(error => {
        console.error('Error fetching modifier products:', error);
      });
    }
  }, [selectedModifier, setSelectedItems]);

  const isSelected = (menuId) => {
    return selectedItems[menuId] || false;
  };

  const handleCheckboxChange = (menuId) => (event) => {
    setSelectedItems((prevState) => ({
      ...prevState,
      [menuId]: event.target.checked,
    }));
  };

  const handleSave = async () => {
    const selectedProductIds = Object.keys(selectedItems).filter(key => selectedItems[key]);

    try {
      const response = await fetch(`${props.api}api/modifier/ext/product/${selectedModifier.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products: selectedProductIds.map(id => parseInt(id))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Success', `Modifier updated successfully`, 'success');
      } else {
        Swal.fire({
          title: 'Failed!',
          text: `Failed to update modifier`,
          icon: 'error',
          customClass: {
            container: 'swal2-container'
          }
        });
      }

    } catch (error) {
      console.error('Error saat mengupdate produk:', error);
    }

    onClose();
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredMenuItems(
      menuItems.filter(menu => menu.name.toLowerCase().includes(query))
    );
  };


  return (
    <Dialog open={open} fullWidth maxWidth="xs">
      <DialogTitle textAlign="center"
        variant='h5'
        fontWeight={600}>
        Apply Set to Products
      </DialogTitle>
      
      <FormGroup sx={{ p: 3, pt: 2 ,minHeight: '400px'}}>

        <TextField
            variant="outlined"
            placeholder="Search"
            fullWidth
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 2 ,fontWeight: '600', fontFamily: 'Nunito, sans-serif'}}
          />

        <Box sx={{ maxHeight: '300px', overflowY: 'scroll', display: 'flex', flexDirection: 'column' }}>
          {filteredMenuItems.length > 0 ? (
            filteredMenuItems.map((menu) => (
              <FormControlLabel
                key={menu.id}
                control={
                  <Checkbox
                    checked={isSelected(menu.id)}
                    onChange={handleCheckboxChange(menu.id)}
                  />
                }
                label={<Typography style={{ fontWeight: 'bold' }}>{menu.name}</Typography>}
              />
            ))
          ) : (
            <Typography>No menu items available</Typography>
          )}
        </Box>
      </FormGroup>

      <DialogActions sx={{ p:3, pt:2}}>
        <Button onClick={onClose}>Cancel</Button>
        <Button           
        style={{ backgroundColor: 'brown', color: 'white' }}
        variant="contained"
        onClick={handleSave}
        sx={{ ml: 2, width: '120px' }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export default ModifierPage;