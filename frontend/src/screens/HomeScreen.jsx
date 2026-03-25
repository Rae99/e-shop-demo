import Product from '../components/Product.jsx';
import { useGetProductsQuery } from '../slices/productsApiSlice.js';
import { Row, Col } from 'react-bootstrap';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';
import { useParams } from 'react-router';


const HomeScreen = () => {
  const { pageNumber } = useParams();
  const { data, error, isLoading } = useGetProductsQuery({ pageNumber });

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant="danger">{error?.data?.message || error.error}</Message>
    );
  }

  return (
    <>
      <h1>Latest Products</h1>
      <Row>
        {data.products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
            <Product product={product} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default HomeScreen;
