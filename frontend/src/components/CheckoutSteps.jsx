import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  return (
    <div>
      <Nav className="justify-content-center mb-4">
        <Nav.Item>
          <LinkContainer to="/login">
            <Nav.Link disabled={!step1}>Sign In</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to="/shipping">
            <Nav.Link disabled={!step2}>Shipping</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to="/payment">
            <Nav.Link disabled={!step3}>Payment</Nav.Link>
          </LinkContainer>
        </Nav.Item>
        <Nav.Item>
          <LinkContainer to="/placeorder">
            <Nav.Link disabled={!step4}>Place Order</Nav.Link>
          </LinkContainer>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default CheckoutSteps;
