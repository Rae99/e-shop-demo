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
      // [LEARN] These two lines can be in either order — both work correctly.
      // React state updates are not immediate: setKeyword('') only schedules a re-render.
      // Within this function call, `keyword` is a snapshot of this render's value (e.g. 'apple'),
      // so navigate() always reads the original input, regardless of order.
      // Re-render (where keyword actually becomes '') happens after this handler finishes.
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
