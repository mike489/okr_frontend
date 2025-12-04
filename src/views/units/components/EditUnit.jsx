"use client";

import * as React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import PropTypes from "prop-types";
import GetToken from "utils/auth-token";
import ActivityIndicator from "ui-component/indicators/ActivityIndicator";
import Backend from "services/backend";

// ------------------------------- VALIDATION ------------------------------- //
const validationSchema = Yup.object({
  name: Yup.string().required("Unit name is required"),
  type: Yup.string().required("Unit type is required"),
  parent: Yup.string().nullable(),  // <-- Fixed (no UUID blocking)
  head: Yup.string().required("Head user is required"),
  description: Yup.string().nullable(),
});

// ------------------------------- EDIT UNIT ------------------------------- //
const EditUnit = ({ edit, isEditing, selectedUnit, types, onClose, handleSubmission }) => {
  const [users, setUsers] = React.useState([]);
  const [units, setUnits] = React.useState({ loading: false, data: [] });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: selectedUnit?.name || "",
      type: String(selectedUnit?.unit_type?.id || ""),
      parent: selectedUnit?.parent_id ? String(selectedUnit?.parent_id) : "",
      head: selectedUnit?.head?.id ? String(selectedUnit?.head?.id) : "",
      description: selectedUnit?.description || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        name: values.name.trim(),
        type: values.type,
        parent: values.parent || null,
        head: values.head,
        description: values.description.trim() || null,
      };

      console.log("EDIT PAYLOAD →", payload);
      handleSubmission(payload);
    },
  });

  // --------------------------- Fetch Users --------------------------- //
  const fetchUsers = async () => {
    try {
      const token = await GetToken();
      const res = await fetch(Backend.api + Backend.users, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setUsers(json.success ? json.data?.data || [] : []);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  // --------------------------- Fetch Units --------------------------- //
  const fetchUnits = async () => {
    setUnits({ loading: true, data: [] });
    try {
      const token = await GetToken();
      const res = await fetch(Backend.api + Backend.allUnits, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      setUnits({
        loading: false,
        data: json?.data?.data?.data || [],
      });
    } catch (err) {
      toast.error("Failed to load units");
      setUnits({ loading: false, data: [] });
    }
  };

  // --------------------------- Load Data on Open --------------------------- //
  React.useEffect(() => {
    if (edit && selectedUnit) {
      fetchUsers();
      fetchUnits();
    }
  }, [edit, selectedUnit]);

  return (
    <Dialog open={edit} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pr: 2 }}>
        <DialogTitle>Edit Unit</DialogTitle>
        <IconButton onClick={onClose}>
          <IconX size={20} />
        </IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {/* Unit Name */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Unit Name</InputLabel>
            <OutlinedInput
              name="name"
              label="Unit Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
            />
            <FormHelperText error>
              {formik.touched.name && formik.errors.name}
            </FormHelperText>
          </FormControl>

          {/* Unit Type */}
          <FormControl fullWidth sx={{ mt: 3 }} error={formik.touched.type && Boolean(formik.errors.type)}>
            <InputLabel>Unit Type</InputLabel>
            <Select
              name="type"
              value={formik.values.type}
              onChange={(e) => formik.setFieldValue("type", e.target.value)}
            >
              {types.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
          </FormControl>

          {/* Parent Unit */}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Parent Unit</InputLabel>
            <Select
              name="parent"
              value={formik.values.parent}
              onChange={(e) => formik.setFieldValue("parent", e.target.value)}
              disabled={units.loading}
            >
              <MenuItem value="">
                <em>None (Top Level)</em>
              </MenuItem>

              {units.loading ? (
                <MenuItem disabled>
                  <ActivityIndicator size={18} /> Loading...
                </MenuItem>
              ) : (
                units.data
                  .filter((u) => u.id !== selectedUnit?.id) // prevent self-parent
                  .map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>

          {/* Head User */}
          <FormControl fullWidth sx={{ mt: 3 }} error={formik.touched.head && Boolean(formik.errors.head)}>
            <InputLabel>Head (User)</InputLabel>
            <Select
              name="head"
              value={formik.values.head}
              onChange={(e) => formik.setFieldValue("head", e.target.value)}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={String(user.id)}>
                  {user.name} {user.email && `(${user.email})`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formik.touched.head && formik.errors.head}</FormHelperText>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description (Optional)"
            name="description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            sx={{ mt: 3 }}
          />
        </DialogContent>

        {/* Buttons */}
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isEditing}   // only disabled when real loading
          >
            {isEditing ? <CircularProgress size={20} /> : "Update Unit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

EditUnit.propTypes = {
  edit: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  selectedUnit: PropTypes.object,
  types: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default EditUnit;
