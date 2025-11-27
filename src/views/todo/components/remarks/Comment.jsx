import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography } from '@mui/material';

const Comment = ({ comment }) => {
  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="body1">{comment}</Typography>
    </Box>
  );
};

Comment.propTypes = {
  comment: PropTypes.string.isRequired,
};

export default Comment;
