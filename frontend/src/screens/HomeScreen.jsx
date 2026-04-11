import Product from '../components/Product.jsx';
import { useGetProductsQuery } from '../slices/productsApiSlice.js';
import { Row, Col } from 'react-bootstrap';
import Loader from '../components/Loader.jsx';
import Message from '../components/Message.jsx';
import { useParams } from 'react-router';
import Paginate from '../components/Paginate.jsx';
import { Link } from 'react-router-dom';
import ProductCarousel from '../components/ProductCarousel.jsx';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const { data, error, isLoading } = useGetProductsQuery({
    pageNumber,
    keyword,
  });

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
      {keyword ? (
        <Link to="/" className="btn btn-light mb-4">
          Go Back
        </Link>
      ) : (
        <ProductCarousel />
      )}
      <h1>Latest Products</h1>
      <Row>
        {data.products.map((product) => (
          <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
            <Product product={product} />
          </Col>
        ))}
      </Row>
      <Paginate
        page={data.page}
        pages={data.pages}
        keyword={keyword ? keyword : ''}
      />{' '}
      {/* pass {keyword} is also fine, undefined will be treated as empty string in Paginate component; but note that passing in null will cause issues */}
    </>
  );
};

export default HomeScreen;
