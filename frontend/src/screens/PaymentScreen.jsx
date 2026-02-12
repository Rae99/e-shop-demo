import React, { use } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import FormContainer from '../components/FormContainer';
import { Form } from 'react-bootstrap';
import CheckoutSteps from '../components/CheckoutSteps.jsx';
import { Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../slices/cartSlice.js';
import { useEffect } from 'react';
import Button from 'react-bootstrap/Button';

const PaymentScreen = () => {
  const [paymentMethod, setPaymentMethod] = useState('PayPal');
  const { shippingAddress } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!shippingAddress?.address) {
      // {} is truthy, so we check for address property to determine if shippingAddress is valid
      navigate('/shipping');
    }
  }, [navigate, shippingAddress]);

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <h1>Payment Method</h1>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          dispatch(savePaymentMethod(paymentMethod));
          navigate('/placeorder');
        }}
      >
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              type="radio"
              label="PayPal or Credit Card"
              id="PayPal"
              name="paymentMethod"
              value="PayPal"
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
        </Form.Group>
        <Button type="submit" variant="primary" className="my-3">
          Continue
        </Button>
      </Form>
    </FormContainer>
  );
};

export default PaymentScreen;
