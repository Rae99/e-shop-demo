import { Card, ListGroup } from 'react-bootstrap';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Message from '../components/Message.jsx';
import Loader from '../components/Loader.jsx';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';

import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import {
  useGetOrderQuery,
  usePayOrderMutation,
  useGetPayPalClientIdQuery,
} from '../slices/ordersApiSlice.js';
import { toast } from 'react-toastify';

const OrderScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const orderId = useParams().id;
  const { data: order, isLoading, error, refetch } = useGetOrderQuery(orderId);

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation(); // rename loadingPay to avoid conflict with isLoading from getOrder query
  const {
    data: paypalClientId,
    isLoading: loadingPayPalClientId,
    error: errorPayPalClientId,
  } = useGetPayPalClientIdQuery();

  useEffect(() => {
    if (!errorPayPalClientId && !loadingPayPalClientId && paypalClientId) {
      const loasdPayPalScript = async () => {
        paypalDispatch({
          type: 'resetOptions',
          value: {
            'client-id': paypalClientId,
            currency: 'USD',
          },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      };

      if (order && !order.isPaid) {
        if (!window.paypal) {
          loasdPayPalScript();
        }
      }
    }
  }, [
    order,
    errorPayPalClientId,
    loadingPayPalClientId,
    paypalClientId,
    paypalDispatch,
  ]);

  const onApprove = async (data, actions) => {
    try {
      const details = await actions.order.capture();
      await payOrder({ id: order._id, paymentResult: details }).unwrap();
      refetch();
      toast.success('Payment successful!');
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const onApproveTest = async () => {
    try {
      await payOrder({
        id: order._id,
        paymentResult: {
          id: 'TEST12345',
          status: 'COMPLETED',
          update_time: new Date().toISOString(),
          payer: {
            email_address: userInfo.email,
          },
        },
      }).unwrap();
      refetch();
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const onError = (err) => {
    toast.error(err.message);
  };

  const createOrder = (data, actions) => {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: order.totalPrice,
            },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  };

  return (
    <>
      <h1>Order Details</h1>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <Row>
          <Col md={8}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h2>Shipping</h2>
                <p>
                  <strong>Name: </strong> {order.user.name}
                </p>
                <p>
                  <strong>Email: </strong>{' '}
                  <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
                  {/* ? */}
                </p>
                <p>
                  <strong>Address: </strong>
                  {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                  {order.shippingAddress.postalCode},{' '}
                  {order.shippingAddress.country}
                </p>
                {order.isDelivered ? (
                  <Message variant="success">
                    Delivered on {order.deliveredAt}
                  </Message>
                ) : (
                  <Message variant="danger">Not Delivered</Message>
                )}
              </ListGroup.Item>

              <ListGroup.Item>
                <h2>Payment Method</h2>
                <p>
                  <strong>Method: </strong>
                  {order.paymentMethod}
                </p>
                {order.isPaid ? (
                  <Message variant="success">Paid on {order.paidAt}</Message>
                ) : (
                  <Message variant="danger">Not Paid</Message>
                )}
              </ListGroup.Item>
              <ListGroup.Item>
                <h2>Order Items</h2>
                {order.orderItems.length === 0 ? (
                  <Message>Order is empty</Message>
                ) : (
                  <ListGroup variant="flush">
                    {order.orderItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col>{item.name}</Col>
                          <Col md={4}>
                            {item.qty} x ${item.price} = $
                            {item.qty * item.price}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm">
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>Order Summary</h2>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>${order.itemsPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Shipping</Col>
                    <Col>${order.shippingPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>${order.taxPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Total</Col>
                    <Col>${order.totalPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  {!order.isPaid && (
                    <ListGroup.Item>
                      {loadingPay && <Loader />}
                      {isPending ? (
                        <Loader />
                      ) : (
                        <div>
                          <Button
                            onClick={onApproveTest}
                            style={{ marginBottom: '10px' }}
                          >
                            Test Pay
                          </Button>

                          <PayPalButtons
                            createOrder={createOrder}
                            onApprove={onApprove}
                            onError={onError}
                          />
                        </div>
                      )}
                    </ListGroup.Item>
                  )}

                  {/* place holder for mark as delivered  */}
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default OrderScreen;
