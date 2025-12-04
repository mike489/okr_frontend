// material-ui
import Grid from '@mui/material/Grid';
import useMediaQuery from '@mui/material/useMediaQuery';

// project imports
import AuthWrapper from './components/AuthWrapper';
import AuthLogin from './components/auth-forms/AuthLogin';

// ================================|| AUTH - LOGIN ||================================ //

const Login = () => {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AuthWrapper>
      <Grid item xs={12}>
        <AuthLogin />
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
