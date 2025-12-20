import { dashboard } from './dashboard';
import { getOrgStructure } from './org-structure';
import { Accounts } from './account';
import { settings } from './settings';
import Footer from 'views/authentication/components/Footer';
import { reports } from './reports';
import { company } from './company';

const menuItems = {
  items: [
    dashboard(),
    // company(),
    getOrgStructure(),
    reports(),
    Accounts(),
    // settings()
    // <Footer />
  ],
};

export default menuItems;
