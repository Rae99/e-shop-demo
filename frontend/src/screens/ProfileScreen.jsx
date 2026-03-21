import React from 'react';
import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import { useUpdateUserProfileMutation } from '../slices/usersApiSlice.js';
import { toast } from 'react-toastify';
import Loader from '../components/Loader.jsx';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col, Row, Tab } from 'react-bootstrap';
import { setCredentials } from '../slices/authSlice.js';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { useGetUserDetailsQuery } from '../slices/usersApiSlice.js';
import { FaTimes } from 'react-icons/fa';
import Message from '../components/Message.jsx';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice.js';
import Table from 'react-bootstrap/Table';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [updateUserProfile, { isLoading: loadingUpdateProfile }] =
    useUpdateUserProfileMutation(); // rename isLoading to loadingUpdateProfile to avoid conflict with orders loading state
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await updateUserProfile({
          name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials(res)); // Update the auth state with the new user info
        toast.success('Profile updated successfully!');
      } catch (err) {
        console.error(err);
        toast.error(
          err?.data?.message ||
            err.error ||
            'Failed to update profile. Please try again.',
        );
      }
    }
  };

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
    }
  }, [userInfo, userInfo.name, userInfo.email]);

  console.log('orders sample:', orders?.[0]);
  return (
    <Row>
      <Col md={3}>
        <h2>User Profile</h2>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId="email" className="my-2">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="password" className="my-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group controlId="confirmPassword" className="my-2">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Button type="submit" variant="primary" className="my-3">
            Update
          </Button>
          {loadingUpdateProfile && <Loader />}
        </Form>
      </Col>
      <Col md={9}>
        <h2>My Orders</h2>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders &&
                orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>
                      {order.createdAt && order.createdAt.substring(0, 10)}
                    </td>
                    <td>${order.totalPrice}</td>
                    <td>
                      {order.isPaid ? (
                        order.paidAt && order.paidAt.substring(0, 10) // show only the date part, not the time part
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        order.deliveredAt && order.deliveredAt.substring(0, 10)
                      ) : (
                        <FaTimes style={{ color: 'red' }} />
                      )}
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/order/${order._id}`}
                        variant="light"
                        className="btn-sm"
                      >
                        Details
                      </Button>
                    </td>
                    {/* <td>
                      <LinkContainer to={`/order/${order._id}`}>
                        <Button variant="light" className="btn-sm">
                          Details
                        </Button>
                      </LinkContainer>
                    </td> */}
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
