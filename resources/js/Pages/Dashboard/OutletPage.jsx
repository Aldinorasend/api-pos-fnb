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
  Switch,
  TextField,
  Tooltip,
  CircularProgress,
  FormControl,
  Chip,
  Typography,
  ButtonBase,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from '@mui/material';
import { AddPhotoAlternate, Delete, Edit } from '@mui/icons-material';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs'
import { Head, usePage } from '@inertiajs/inertia-react';
import { set } from 'lodash';


const OutletPage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const { translations } = usePage().props;

  useEffect(() => {
    getOutletData()

    setIsLoading(false);
  }, []);

  const getOutletData = async () => {
    const response = await fetch(`${props.api}api/outlet`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    });
    const json = await response.json();
    setData(json.data);
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
          const response = await fetch(`${props.api}api/outlet/${row.original.id}`, {
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

          getOutletData();
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
        accessorKey: 'outlet_name',
        header: 'Name',
        size: 140,
      },
      {
        accessorKey: 'email',
        header: 'Email',
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
            <Chip size='small' label={isActive ? 'Active' : 'Inactive'} color={isActive ? 'success' : 'error'} />
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
    <User title={translations.outlet} userType={props.auth.user.role_id}>
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
            <Tooltip arrow placement="right" title="Status">
              <Switch
                checked={Boolean(row.original.is_active)}
                inputProps={{ "aria-label": "controlled" }}
                onChange={async (e) => {
                  await fetch(`${props.api}api/outlet/status/${row.original.id}`, {
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
                    .then((json) => { getOutletData() })
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
          >{translations.create_outlet}</Button>
        )}
      />
      <CreateNewOutletModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={getOutletData}
        api={props.api}
      />
      <EditOutletModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={getOutletData}
        data={editingRow}
        setData={setEditingRow}
        api={props.api}
      />
    </User>
  );
};

export const CreateNewOutletModal = ({ open, onClose, onSubmit, api }) => {
  const [formValues, setFormValues] = useState({
    outlet_name: "",
    email: "",
    is_dinein: 0,
    is_label: 0,
    is_kitchen: 0,
  });
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const { translations } = usePage().props;

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormValues({
      ...formValues,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value, // Send 1/0 for booleans
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFormValues({ ...formValues, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setFormValues({ ...formValues, image: null });
    document.getElementById("imageUploadSelector").value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const formData = new FormData();

    formData.append("outlet_name", formValues.outlet_name);
    formData.append("email", formValues.email);
    formData.append("is_dinein", formValues.is_dinein);
    formData.append("is_label", formValues.is_label);
    formData.append("is_kitchen", formValues.is_kitchen);

    if (formValues.image) {
      formData.append("image", formValues.image);
    }

    try {
      const response = await fetch(`${api}api/outlet`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: formData,
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
          is_dinein: 0,
          is_label: 0,
          is_kitchen: 0,
        });
        setImage(null);
        onSubmit();
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">{translations.create_outlet}</DialogTitle>
      <DialogContent>
        <FormControl onSubmit={(e) => e.preventDefault()}>
          <Typography
            sx={{
              borderBottom: 2,
              borderColor: "grey.300",
              color: "GrayText",
              fontWeight: 600,
              mb: 2,
            }}
          >
            GENERAL INFORMATION
          </Typography>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "500px" },
              gap: "1.5rem",
              paddingTop: "1rem",
            }}
          >
            <Stack sx={{ mx: 2 }} direction="row" gap={3}>
              <Stack sx={{ alignItems: "center" }}>
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="imageUploadSelector"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label htmlFor="imageUploadSelector">
                  {image ? (
                    <img
                      src={image}
                      alt="Uploaded"
                      style={{
                        width: "130px",
                        height: "130px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Stack
                      sx={{
                        width: "130px",
                        height: "130px",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "grey.300",
                      }}
                    >
                      <AddPhotoAlternate sx={{ color: "grey.500" }} />
                    </Stack>
                  )}
                </label>
                {image && (
                  <ButtonBase
                    onClick={handleRemoveImage}
                    sx={{ bgcolor: "red", borderRadius: 64, px: 2, py: "1px" }}
                  >
                    <Typography sx={{ color: "white" }}>REMOVE</Typography>
                  </ButtonBase>
                )}
              </Stack>
              <Stack sx={{ flexGrow: 1 }} gap={2}>
                <TextField
                  label="Name"
                  name="outlet_name"
                  value={formValues.outlet_name}
                  onChange={handleChange}
                  error={!!errors.outlet_name}
                  helperText={errors.outlet_name}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formValues.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Stack>
            </Stack>
          </Stack>

          <Typography
            sx={{
              borderBottom: 2,
              borderColor: "grey.300",
              color: "GrayText",
              fontWeight: 600,
              mt: 4,
            }}
          >
            CONFIGURATION
          </Typography>
          <Box sx={{ px: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isDineIn"
                    checked={formValues.is_dinein}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>DINE IN</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isLabel"
                    checked={formValues.is_label}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>PRINT LABEL</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="isKitchen"
                    checked={formValues.is_kitchen}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>PRINT KITCHEN</Typography>}
              />
            </FormGroup>
          </Box>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>{translations.save}</Button>
      </DialogActions>
    </Dialog>
  );
};

export const EditOutletModal = ({ open, onClose, onSubmit, data, setData, api }) => {
  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(data?.image_url || null);
  const { translations } = usePage().props;

  useEffect(() => {
    if (open) {
      // Only set the image if the modal is open
      setImage(data?.image_url || null);
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result); // Preview the image
        setData((prevData) => ({
          ...prevData,
          image: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setData((prevData) => ({
      ...prevData,
      image: null,
    }));
    document.getElementById("imageUploadSelector").value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append("outlet_name", data.outlet_name);
    formData.append("email", data.email);
    formData.append("is_dinein", data.is_dinein ? 1 : 0);
    formData.append("is_label", data.is_label ? 1 : 0);
    formData.append("is_kitchen", data.is_kitchen ? 1 : 0);
    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    try {
      const response = await fetch(`${api}api/outlet/${data.id}`, {
        method: "POST", // PUT might require custom handling in FormData
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 422) {
          setErrors(errorData.errors);
        } else {
          throw new Error(errorData.message || "An error occurred");
        }
      } else {
        const updatedData = await response.json();
        Swal.fire("Success", `${updatedData.message}`, "success");
        onSubmit(updatedData);
        onClose();
      }
    } catch (error) {
      Swal.fire("Failed!", error.message, "error");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">{translations.edit_outlet}</DialogTitle>
      <DialogContent>
        <FormControl>
          <Typography sx={{ borderBottom: 2, borderColor: "grey.300", color: "GrayText", fontWeight: 600, mb: 2 }}>
            GENERAL INFORMATION
          </Typography>
          <Stack
            sx={{
              width: "100%",
              minWidth: { xs: "300px", sm: "360px", md: "500px" },
              gap: "1.5rem",
              paddingTop: "1rem",
            }}
          >
            <Stack sx={{ mx: 2 }} direction="row" gap={3}>
              <Stack sx={{ alignItems: "center" }}>
                <input
                  type="file"
                  style={{ display: "none" }}
                  id="imageUploadSelector"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <label htmlFor="imageUploadSelector">
                  {image ? (
                    <img
                      src={image}
                      alt="Uploaded"
                      style={{ width: "130px", height: "130px", objectFit: "cover" }}
                    />
                  ) : (
                    <Stack
                      sx={{
                        width: "130px",
                        height: "130px",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: "grey.300",
                      }}
                    >
                      <AddPhotoAlternate sx={{ color: "grey.500" }} />
                    </Stack>
                  )}
                </label>
                {image && (
                  <ButtonBase
                    onClick={handleRemoveImage}
                    sx={{ bgcolor: "red", borderRadius: 64, px: 2, py: "1px" }}
                  >
                    <Typography sx={{ color: "white" }}>REMOVE</Typography>
                  </ButtonBase>
                )}
              </Stack>
              <Stack sx={{ flexGrow: 1 }} gap={2}>
                <TextField
                  label="Name"
                  name="outlet_name"
                  value={data?.outlet_name || ""}
                  onChange={handleChange}
                  error={!!errors.outlet_name}
                  helperText={errors.outlet_name}
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={data?.email || ""}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Stack>
            </Stack>
          </Stack>

          <Typography sx={{ borderBottom: 2, borderColor: "grey.300", color: "GrayText", fontWeight: 600, mt: 4 }}>
            CONFIGURATION
          </Typography>
          <Box sx={{ px: 2 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_dinein"
                    checked={data?.is_dinein || false}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>DINE IN</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_label"
                    checked={data?.is_label || false}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>PRINT LABEL</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_kitchen"
                    checked={data?.is_kitchen || false}
                    onChange={handleChange}
                  />
                }
                label={<Typography sx={{ fontWeight: "bold" }}>PRINT KITCHEN</Typography>}
              />
            </FormGroup>
          </Box>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ p: "1.25rem" }}>
        <Button onClick={onClose}>{translations.cancel}</Button>
        <Button color="primary" variant="contained" onClick={handleSubmit}>
          {translations.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OutletPage;