import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MaterialReactTable } from 'material-react-table';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import User from '@/Layouts/User'
import Swal from 'sweetalert2';
import { usePage } from '@inertiajs/inertia-react';

const PaymentPage = (props) => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const { translations } = usePage().props;

    useEffect(() => {
        getPaymentData()
    }, [])

    const getPaymentData = async () => {
        const data = await fetch(`${props.api}api/payment`, {
            method : "GET",
            headers: {
                "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
        });
        const json = await data.json();

        setTableData(json.data);
    }

    const handleCreateNewRow = async (values) => {
        await fetch(`${props.api}api/payment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                "payment_name": values.payment_name,
                "payment_description": values.payment_description
            })
        })
            .then((val) => {
                Swal.fire(
                    "Success",
                    "success On Creating Payment",
                    "success"
                )

                getPaymentData()
            })
            .catch((err) => {
                Swal.fire(
                    'Failed',
                    `${err}`,
                    "error"
                )
            })
    };

    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            //send/receive api updates here, then refetch or update local table data for re-render
            await fetch(`${props.api}api/payment/${row.getValue("id")}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    "payment_name": values.payment_name,
                    "payment_description": values.payment_description
                })
            })
                .then((val) => {
                    Swal.fire(
                        "Success",
                        "success On Update The Payment",
                        "success"
                    )
                })
                .catch((err) => {
                    Swal.fire(
                        'Failed',
                        `${err}`,
                        "error"
                    )
                })
        }

        getPaymentData()
        exitEditingMode()
    };

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const handleDeleteRow = useCallback(
        async (row) => {
            //send api delete request here, then refetch or update local table data for re-render
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
                    await fetch(`${props.api}api/payment/${row.original.id}`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${window.localStorage.getItem("token")}`,
                        },
                    }).then((val) => {
                        Swal.fire(
                            "Success",
                            "data has been deleted",
                            "success"
                        )

                        getPaymentData()
                    }).catch((err) => {
                        Swal.fire(
                            "Failed!",
                            `${err}`,
                            "error"
                        )
                    })
                }
            })
        },
        [tableData],
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
                accessorKey: 'payment_name',
                header: 'Payment',
                size: 140,
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    ...getCommonEditTextFieldProps(cell),
                }),
            },
            {
                accessorKey: 'payment_description',
                header: 'Payment Description',
                size: 180,
                muiTableBodyCellEditTextFieldProps: ({ cell }) => ({
                    ...getCommonEditTextFieldProps(cell),
                }),
            },
        ],
        [getCommonEditTextFieldProps],
    );

    return (
        <User title={translations.payment} userType={props.auth.user.role_id}>
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
                data={tableData}
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
                    >{translations.create_payment}</Button>
                )}
            />
            <CreateNewPaymentModal
                columns={columns}
                open={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSubmit={handleCreateNewRow}
            />
        </User>
    );
}

//example of creating a mui dialog modal for creating new rows

export const CreateNewPaymentModal = ({ open, columns, onClose, onSubmit }) => {
    const { translations } = usePage().props;
    const [values, setValues] = useState(() =>
        columns.reduce((acc, column) => {
            acc[column.accessorKey ?? ''] = '';
            return acc;
        }, {}),
    );

    const handleSubmit = () => {
        //put your validation logic here
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle textAlign="center">{translations.create_payment}</DialogTitle>
            <DialogContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: '100%',
                            minWidth: { xs: '300px', sm: '360px', md: '400px' },
                            gap: '1.5rem',
                        }}
                    >
                        {columns.map((column) => (
                            <TextField
                                key={column.accessorKey}
                                label={column.header}
                                name={column.accessorKey}
                                disabled={column.header === "ID"}
                                onChange={(e) =>
                                    setValues({ ...values, [e.target.name]: e.target.value })
                                }
                            />
                        ))}
                    </Stack>
                </form>
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

export default PaymentPage