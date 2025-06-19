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
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { Delete, Edit } from '@mui/icons-material';
import User from '@/Layouts/User';
import Swal from 'sweetalert2';
import dayjs from 'dayjs'
import { usePage } from '@inertiajs/inertia-react';


const ReferralCodePage = (props) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [tableData, setTableData] = useState(() => data);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([])
  const { translations } = usePage().props;

  useEffect(() => {
    getReferralCode()
    setIsLoading(false)
  }, [])

  const getReferralCode = async () => {
    const data = await fetch(`${props.api}api/referralcode`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
    })
    const json = await data.json()

    setData(json.data)
  }

  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      //send/receive api updates here, then refetch or update local table data for re-render
      await fetch(`${props.api}api/referralcode/${row.original.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          code: values.code,
          description: values.description,
          expired_date: dayjs(values.expired_date).toISOString(),
          discount: values.discount,
          quotas: values.quotas
        })
      })
        .then((val) => {
          Swal.fire(
            "Success",
            "Menu Has Been Updated",
            "success"
          )
        })
        .catch((err) => {
          Swal.fire(
            "Error",
            `${err}`,
            "error"
          )
        })

      getReferralCode()
    }
    exitEditingMode();
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
          //send api delete request here, then refetch or update local table data for re-render
          await fetch(`${props.api}api/referralcode/${row.original.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
          })
            .then((val) => {
              Swal.fire(
                'Deleted!',
                'Referral Code Has Been Deleted.',
                'success'
              )
              getReferralCode()
            })
            .catch((err) => {
              Swal.fire(
                'Failed!',
                `${err}`,
                'error'
              )
              console.error(err);
            })
        }
      })
    },
    [data],
  );

  const getCommonEditTextFieldProps = useCallback(
    (cell) => {
      return {
        error: !!validationErrors[cell.id],
        helperText: validationErrors[cell.id],
        onBlur: (event) => {
          const isValid =
            cell.column.id === 'email'
              ? validateEmail(event.target.value)
              : cell.column.id === 'age'
                ? validateAge(+event.target.value)
                : validateRequired(event.target.value);
          if (!isValid) {
            //set validation error for cell if invalid
            setValidationErrors({
              ...validationErrors,
              [cell.id]: `${cell.column.columnDef.header} is required`,
            });
          } else {
            //remove validation error for cell if valid
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
      {
        accessorKey: 'id',
        header: 'ID',
        enableColumnOrdering: false,
        enableEditing: false, //disable editing on this column
        enableSorting: false,
        size: 80,
      },
      {
        accessorKey: 'code',
        header: 'Referral Code',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "text"
        }),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "text"
        }),
        Cell: ({ cell }) => (cell.row.original.description == null) ? "Tidak Ada Description" : cell.row.original.description
      },
      {
        accessorKey: 'discount',
        header: 'Discount',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "number"
        }),
        Cell: ({ cell }) => `${cell.row.original.discount}%`
      },
      {
        accessorKey: 'quotas',
        header: 'Referral Quotas',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "number"
        }),
        Cell: ({ cell }) => {
          return (
            <>
              {cell.row.original.usaged} / {cell.row.original.quotas}
            </>
          )
        }
      },
      {
        accessorKey: 'expired_date',
        header: 'Expiration',
        size: 140,
        muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
          ...getCommonEditTextFieldProps(cell),
          type: "datetime-local"
        }),
        Cell: ({ cell }) => dayjs(cell.row.original.expired_date).tz("Asia/Jakarta").toDate().toLocaleString('id'),
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
    [getCommonEditTextFieldProps],
  );

  if (isLoading) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <User title={translations.referral_code} userType={props.auth.user.role_id}>
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
        editingMode="modal" //default
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
          >{translations.create_referral_code}</Button>
        )}
      />
      <CreateNewAccountModal
        columns={columns}
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={getReferralCode}
        api={props.api}
      />
    </User>
  );
};

//example of creating a mui dialog modal for creating new rows
export const CreateNewAccountModal = ({ open, columns, onClose, onSubmit, api }) => {
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [expiredDate, setExpiredDate] = useState(dayjs())
  const [discount, setDiscount] = useState("")
  const [quotas, setQuotas] = useState("")
  const { translations } = usePage().props;

  const handleSubmit = async () => {
    // //put your validation logic here
    // onSubmit(values);
    await fetch(`${api}api/referralcode`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        code: code,
        description: description,
        expired_date: expiredDate.$d.toISOString(),
        discount: discount,
        quotas: quotas,
      })
    })
      .then(response => {
        if (response.status == false) {
          Swal.fire(
            "Failed",
            `${response.message}`,
            "error"
          )
          return;   
        }
        Swal.fire(
          "Success",
          "Success On Creating new Referral Code",
          "success"
        )
      })
      .catch(error => {
        Swal.fire(
          "Failed!",
          `${error}`,
          "error"
        )
      })
    onSubmit()
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle textAlign="center">{translations.create_referral_code}</DialogTitle>
      <DialogContent>
        <FormControl onSubmit={(e) => e.preventDefault()}>
          <Stack
            sx={{
              width: '100%',
              minWidth: { xs: '300px', sm: '260px', md: '500px' },
              gap: '1.5rem',
            }}
          >
            {/* <InputLabel id="categoryID">Category</InputLabel> */}
            <TextField
              label="Referral Code"
              name="referralcode"
              onChange={(e) => setCode(e.target.value)}
            />
            <TextField
              label="description"
              name="description"
              onChange={(e) => setDescription(e.target.value)}
            />
            <TextField
              label="Discount In Percentage"
              name="discount"
              onChange={(e) => setDiscount(e.target.value)}
            />
            <TextField
              label="Quotas"
              name="quotas"
              onChange={(e) => setQuotas(e.target.value)}
            />
            <label>Expired Date</label>
            <DateTimePicker value={expiredDate} onChange={(e) => setExpiredDate(e)} slotProps={{ textField: { size: 'small' } }} />
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
const validateEmail = (email) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
const validateAge = (age) => age >= 18 && age <= 50;

export default ReferralCodePage;
