import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { styled, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, where,query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { toast, Toaster } from "react-hot-toast";

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "center",
});

const ContactManager = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [info, setInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
  });

  const [contacts, setContacts] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInfo((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let errors = {};

    if (!info.firstName) errors.firstName = "First Name is required!";
    if (!info.lastName) errors.lastName = "Last Name is required!";
    if (!info.email) {
      errors.email = "Email is required!";
    } else if (!/\S+@\S+\.\S+/.test(info.email)) {
      errors.email = "Enter a valid email!";
    }
    if (!info.phone) {
      errors.phone = "Phone Number is required!";
    } else if (!/^[6-9]\d{9}$/.test(info.phone)) {
      errors.phone = "Enter a valid 10-digit phone number!";
    }
    if (!info.company) errors.company = "Company is required!";
    if (!info.jobTitle) errors.jobTitle = "Job Title is required!";

    setFormErrors(errors);

    return errors.length===0;
  };

  const [editContactId, setEditContactId] = useState(null);

  const checkDuplicate = async () => {
    const emailQuery = query(collection(db, 'contacts'), where('email', '==', info.email));
    const phoneQuery = query(collection(db, 'contacts'), where('phone', '==', info.phone));
    const companyQuery = query(collection(db, 'contacts'), where('company', '==', info.company));
    const jobTitleQuery = query(collection(db, 'contacts'), where('jobTitle', '==', info.phone));

    const emailSnapshot = await getDocs(emailQuery);
    const phoneSnapshot = await getDocs(phoneQuery);
    const companySnapshot = await getDocs(companyQuery);
    const jobTitleSnapshot = await getDocs(jobTitleQuery);

    return !emailSnapshot.empty || !phoneSnapshot.empty || !companySnapshot.empty || !jobTitleSnapshot.empty;
  };

  const handleAddOrUpdateContact = async () => {
    if (validateForm()) {
        try {
            if (!editContactId) {
                const isDuplicate = await checkDuplicate();
                if (isDuplicate) {
                  toast.error("A record already exists with you've entered details");
                  return;
                }
            }

            if (editContactId) {
              const contactDoc = doc(db, 'contacts', editContactId);
              await updateDoc(contactDoc, info);
              toast.success('Contact updated successfully!');
              setContacts((prev) =>
                prev.map((contact) => (contact.id === editContactId ? { id: contact.id, ...info } : contact))
              );
            } else {
              const docRef = await addDoc(collection(db, 'contacts'), info);
              toast.success('Contact added successfully!');
              setContacts([...contacts, { id: docRef.id, ...info }]);
            }
    
            handleClose();
            setInfo({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              company: '',
              jobTitle: '',
            });
            setEditContactId(null);
          } catch (e) {
            toast.error('Error processing the contact. Please try again.');
        }
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      const querySnapshot = await getDocs(collection(db, "contacts"));
      const contactsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContacts(contactsData);
    };

    fetchContacts();
  }, []);

  const handleEditContact = (contact) => {
    setInfo({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      jobTitle: contact.jobTitle,
    });
    setEditContactId(contact.id);
    handleOpen();
  };

  const handleDeleteContact = async (id) => {
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast.success("Contact deleted successfully!");
      setContacts((prev) => prev.filter((contact) => contact.id !== id));
    } catch (e) {
      toast.error("Error deleting contact. Please try again.");
    }
  };

  // For viewing the full details of contact
  const [viewContact, setViewContact] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const handleViewClose = () => setViewOpen(false); 

  const handleViewContact = (contact) => {
    setViewContact(contact);
    setViewOpen(true);
  };

  // for searching the contact
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
  };

  const filteredContacts = contacts.filter((contact) =>
      contact.firstName.toLowerCase().includes(searchQuery) ||
      contact.lastName.toLowerCase().includes(searchQuery) ||
      contact.email.toLowerCase().includes(searchQuery) ||
      contact.phone.toLowerCase().includes(searchQuery) ||
      contact.company.toLowerCase().includes(searchQuery) ||
      contact.jobTitle.toLowerCase().includes(searchQuery) 
  );
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const paginatedContacts = filteredContacts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  return (
    <Box>
      <AppBar position="sticky" sx={{ backgroundColor: "#264fe6" }}>
        <StyledToolbar>
          <Typography variant="h5" fontWeight={500}>
            Erino's Contact Management
          </Typography>
        </StyledToolbar>
      </AppBar>

      <Box sx={{ width: "90%", backgroundColor: "white", margin: "2rem auto", borderRadius: "5px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            gap: 2,
            maxWidth: "800px",
            margin: "20px auto",
          }}
        >
          <TextField id="search" 
          label="Search Contacts" 
          fullWidth={true} 
          size="large" 
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Name,Email,Phone"
          />
          <Button variant="contained" color="primary" sx={{ whiteSpace: "nowrap" }} size="large" onClick={handleOpen}>
            Add Contact
          </Button>


          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>{editContactId ? 'Edit Contact' : 'Add New Contact'}</DialogTitle>
            <DialogContent>
              <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, margin: '1rem 0' }}>
                <TextField
                  label="First Name"
                  variant="outlined"
                  required
                  value={info.firstName}
                  onChange={handleInputChange}
                  name="firstName"
                  error={!!formErrors.firstName}
                  helperText={formErrors.firstName}
                />
                <TextField
                  label="Last Name"
                  variant="outlined"
                  required
                  value={info.lastName}
                  onChange={handleInputChange}
                  name="lastName"
                  error={!!formErrors.lastName}
                  helperText={formErrors.lastName}
                />
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  required
                  value={info.email}
                  onChange={handleInputChange}
                  name="email"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
                <TextField
                  label="Phone Number"
                  type="number"
                  variant="outlined"
                  required
                  value={info.phone}
                  onChange={handleInputChange}
                  name="phone"
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                />
                <TextField
                  label="Company"
                  variant="outlined"
                  required
                  value={info.company}
                  onChange={handleInputChange}
                  name="company"
                  error={!!formErrors.company}
                  helperText={formErrors.company}
                />
                <TextField
                  label="Job Title"
                  variant="outlined"
                  required
                  value={info.jobTitle}
                  onChange={handleInputChange}
                  name="jobTitle"
                  error={!!formErrors.jobTitle}
                  helperText={formErrors.jobTitle}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleAddOrUpdateContact}>
                {editContactId ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={viewOpen} onClose={handleViewClose} maxWidth="md" fullWidth>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogContent>
              {viewContact && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography><strong>First Name:</strong> {viewContact.firstName}</Typography>
                  <Typography><strong>Last Name:</strong> {viewContact.lastName}</Typography>
                  <Typography><strong>Email:</strong> {viewContact.email}</Typography>
                  <Typography><strong>Phone:</strong> {viewContact.phone}</Typography>
                  <Typography><strong>Company:</strong> {viewContact.company}</Typography>
                  <Typography><strong>Job Title:</strong> {viewContact.jobTitle}</Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleViewClose} color="primary">Close</Button>
            </DialogActions>
          </Dialog>
        </Box>

        <TableContainer component={Paper} sx={{ maxWidth: "80%", margin: "0 auto" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>FirstName</TableCell>
                <TableCell>LastName</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>{contact.firstName}</TableCell>
                  <TableCell>{contact.lastName}</TableCell>
                  <TableCell>{contact.email}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    <IconButton onClick={() => handleViewContact(contact)}>
                        <VisibilityIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleEditContact(contact)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteContact(contact.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={contacts.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ maxWidth: "800px", margin: "0 auto", mt: 2 }}
        />
      </Box>

      <Toaster position="top-right"/>
    </Box>
  );
};

export default ContactManager;
