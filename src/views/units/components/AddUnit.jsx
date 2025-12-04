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

// Validation
const validationSchema = Yup.object({
  name: Yup.string().required("Unit name is required"),
  type: Yup.string().required("Unit type is required"),
  head: Yup.string().required("Head user is required"),
  parent: Yup.string().nullable(),
  description: Yup.string().nullable(),
});

const AddUnit = ({ add, isAdding, types, onClose, handleSubmission }) => {
  const [users, setUsers] = React.useState([]);
  const [units, setUnits] = React.useState({ loading: false, data: [] });

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "",
      head: "",
      parent: "",
      description: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // THIS IS THE FINAL FIX THAT WORKS
      const payload = {
        name: values.name.trim(),
        type: values.type.toString(),        // ← Force string (Laravel loves this)
        head: values.head.toString(),        // ← Force string
        parent: values.parent ? values.parent.toString() : null,
        description: values.description.trim() || null,
      };

      console.log("PAYLOAD SENT TO BACKEND →", payload);
      // You will see: { name: "HR", type: "2", head: "15", parent: null, ... }

      handleSubmission(payload); // ← Must be plain object, not FormData!
    },
  });

  React.useEffect(() => {
    if (!add) formik.resetForm();
  }, [add]);

  // Fetch users & units
  React.useEffect(() => {
    if (!add) return;

    const load = async () => {
      const token = await GetToken();

      // Users
      const uRes = await fetch(Backend.api + Backend.users, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uJson = await uRes.json();
      setUsers(uJson.success ? uJson.data?.data || [] : []);

      // Units
      const unitRes = await fetch(Backend.api + Backend.allUnits, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const unitJson = await unitRes.json();
      setUnits({
        loading: false,
        data: unitJson?.data?.data?.data || [],
      });
    };

    load();
  }, [add]);

  return (
    <Dialog open={add} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", pr: 2 }}>
        <DialogTitle>Add New Unit</DialogTitle>
        <IconButton onClick={onClose}><IconX /></IconButton>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          {/* Name */}
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Unit Name *</InputLabel>
            <OutlinedInput
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && !!formik.errors.name}
            />
            <FormHelperText error>{formik.touched.name && formik.errors.name}</FormHelperText>
          </FormControl>

          {/* Type */}
          <FormControl fullWidth sx={{ mt: 3 }} error={formik.touched.type && !!formik.errors.type}>
            <InputLabel>Unit Type *</InputLabel>
            <Select
              value={formik.values.type}
              onChange={(e) => formik.setFieldValue("type", e.target.value)}
            >
              <MenuItem value="" disabled>Select Type</MenuItem>
              {types.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </Select>
            <FormHelperText>{formik.touched.type && formik.errors.type}</FormHelperText>
          </FormControl>

          {/* Parent */}
          <FormControl fullWidth sx={{ mt: 3 }}>
            <InputLabel>Parent Unit</InputLabel>
            <Select
              value={formik.values.parent}
              onChange={(e) => formik.setFieldValue("parent", e.target.value || "")}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {units.data.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Head */}
          <FormControl fullWidth sx={{ mt: 3 }} error={formik.touched.head && !!formik.errors.head}>
            <InputLabel>Head User *</InputLabel>
            <Select
              value={formik.values.head}
              onChange={(e) => formik.setFieldValue("head", e.target.value)}
            >
              <MenuItem value="" disabled>Select User</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{formik.touched.head && formik.errors.head}</FormHelperText>
          </FormControl>

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formik.values.description}
            onChange={formik.handleChange}
            sx={{ mt: 3 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isAdding || !formik.isValid || !formik.dirty}
          >
            {isAdding ? <CircularProgress size={20} /> : "Add Unit"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

AddUnit.propTypes = {
  add: PropTypes.bool.isRequired,
  isAdding: PropTypes.bool.isRequired,
  types: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  handleSubmission: PropTypes.func.isRequired,
};

export default AddUnit;