import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router';

const SearchBox = () => {
  const [keyword, setKeyword] = React.useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
      setKeyword(''); // clear the input box
    } else {
      navigate('/');
    }
  };

  return (
    <Form className="d-flex" onSubmit={submitHandler}>
      <Form.Control
        type="text"
        name="q"
        placeholder="Search products..."
        className="mr-sm-2 ml-sm-5"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <Button type="submit" variant="outline-light" className="my-2 my-sm-0">
        Search
      </Button>
    </Form>
  );
};

export default SearchBox;
