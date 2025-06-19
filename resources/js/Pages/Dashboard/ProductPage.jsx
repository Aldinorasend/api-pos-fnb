import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Tooltip,
  CircularProgress,
  Select,
  FormControl,
  Switch,
  Typography,
  Chip,
} from '@mui/material';
import { Delete, Edit, Storefront } from '@mui/icons-material';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import useCurrencyRupiah from '@/hooks/useCurrencyRupiah';
import ModifyProduct from '@/Components/User/ModifyProduct';
import { usePage } from '@inertiajs/inertia-react';

const ProductPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([])
  const [category, setCategory] = useState([])
  const [modalProduct, setModalProduct] = useState(null)
  const [outlets, setOutlets] = useState([])
  const [selectedOutlet, setSelectedOutlet] = useState({})
  const [modifiers, setModifiers] = useState([])
  const { translations } = usePage().props;

  useEffect(() => {
    getOutletsData()

    setIsLoading(false)
  }, [])

  useEffect(() => {
    setData([])
    getModifierData()
    getCategoryData()
    getProductData()
  }, [selectedOutlet])

  const getProductData = async () => {
    const data = await fetch(`${props.api}api/product/ext/outlet/${selectedOutlet.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setData(json.data)
  }

  const getCategoryData = async () => {
    const data = await fetch(`${props.api}api/category/outlet/${selectedOutlet.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setCategory(json.data)
  }

  const getModifierData = async () => {
    const data = await fetch(`${props.api}api/modifier/ext/outlet/${selectedOutlet.id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setModifiers(json.data)
  }

  const getOutletsData = async () => {
    const data = await fetch(`${props.api}api/outlet/current/user`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setOutlets(json.data);
    setSelectedOutlet(json.data[0]);
  }

  const handleCreateRow = () => {
    setModalProduct(null);
    setCreateModalOpen(true);
  }

  const handleEditRow = (row) => {
    setModalProduct(row.original);
    setCreateModalOpen(true);
  }

  const handleCloseModal = () => {
    getProductData();
    setCreateModalOpen(false);
    setModalProduct(null);
  }

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
            const response = await fetch(`${props.api}api/product/${row.original.id}`, {
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
    
            getProductData();
          } catch (err) {
            Swal.fire('Failed!', `${err.message || 'An error occurred.'}`, 'error');
          }
        }
      })
    },
    [data],
  );

  const handleOutletChange = (event) => {
    setSelectedOutlet(event.target.value);
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        size: 140,
      },
      {
        accessorKey: 'category_name',
        header: 'Category',
        size: 140,
      },
      {
        accessorFn: (row) => {
          if (row.variants.length == 1) {
            return useCurrencyRupiah(row.variants[0].price)
          } else {
            return `${row.variants.length} prices`
          }
        },
        id: "price",
        header: 'Price',
        size: 140,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        size: 100,
        enableEditing: false,
        Cell: ({ cell }) => {
          const isActive = cell.getValue() === 1;
          return (
            <Chip size='small' label={isActive ? 'In Stock' : 'Sold Out'} color={isActive ? 'success' : 'error'}/>
          );
        },
      },
    ],
    [category, selectedOutlet],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <User title={translations.product} userType={props.auth.user.role_id}>
      <Typography sx={{ fontWeight: "bold" }}>Outlet</Typography>
      <FormControl sx={{ mb: 2, minWidth: 200, bgcolor: "white" }} size="small">
        <Select
          value={selectedOutlet}
          onChange={handleOutletChange}
          defaultValue={outlets[0]}
        >
          {outlets.map((v,i) => (
          <MenuItem key={i} value={v}>
            <div style={{ display: "flex", alignItems: "center"}}>
              <Storefront sx={{ mr:1 }}/>
              <div>{v.outlet_name}</div>
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
            size: 120,
          },
        }}
        columns={columns}
        data={data}
        enableColumnOrdering
        enableEditing
        renderRowActions={({ row, table }) => (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            {([1, 2].includes(props.auth.user.role_id)) && (
              <>
                <Tooltip arrow placement="left" title="Edit">
                  <IconButton onClick={() => handleEditRow(row)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip arrow placement="right" title="Delete">
                  <IconButton color="error" onClick={() => handleDeleteRow(row)}>
                    <Delete />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Tooltip arrow placement="right" title="Status">
              <Switch
                checked={Boolean(row.original.is_active)}
                inputProps={{ "aria-label": "controlled" }} 
                onChange={async (e) => {
                  await fetch(`${props.api}api/product/ext/available/${row.original.id}`, {
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
                    .then((json) => {getProductData()})
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
        renderTopToolbarCustomActions={() => [1, 2].includes(props.auth.user.role_id) ? (
          <Button 
            color="primary" 
            variant="contained" 
            onClick={()=>setCreateModalOpen(true)} 
          >{translations.create_product}</Button>
        ) : null}
      />
      
      <ModifyProduct
        api={props.api}
        open={createModalOpen}
        onClose={handleCloseModal}
        availableCategories={category}
        availableModifiers={modifiers}
        outlet={selectedOutlet}
        product={modalProduct}
      />
    </User>
  );
};

export default ProductPage;
