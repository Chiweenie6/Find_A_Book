import React, { useState, useEffect } from "react";
import {
  Container,
  Col,
  Form,
  Button,
  Card,
  CardColumns,
} from "react-bootstrap";

import Auth from "../utils/auth";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";

// Import SAVE_BOOK mutation
import { SAVE_BOOK } from "../utils/mutations";
import { useMutation } from "@apollo/client";

const SearchBooks = () => {
  // Create state for holding returned google api data
  const [searchedBooks, setSearchedBooks] = useState([]);
  // Create state for holding our search field data
  const [searchInput, setSearchInput] = useState("");

  // Create state to hold saved bookId values
  const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());

  // Set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
  // Learn more here: https://reactjs.org/docs/hooks-effect.html#effects-with-cleanup
  useEffect(() => {
    return () => saveBookIds(savedBookIds);
  });

  // Use the "useMutation" Hook for mutation SAVE_BOOK
  const [saveBook] = useMutation(SAVE_BOOK);

  // Method to search for books and set state on form submit
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (!searchInput) {
      return false;
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${searchInput}`
      );

      if (!response.ok) {
        throw new Error("🚫 Something went wrong! 🚫");
      }

      const { items } = await response.json();

      const bookData = items.map((book) => ({
        bookId: book.id,
        authors: book.volumeInfo.authors || ["No author to display"],
        title: book.volumeInfo.title,
        description: book.volumeInfo.description,
        image: book.volumeInfo.imageLinks?.thumbnail || "📖",
        link: book.volumeInfo.link,
      }));

      console.log(bookData);

      setSearchedBooks(bookData);
      setSearchInput("");
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle saving a book to our database
  const handleSaveBook = async (bookId) => {
    // find the book in `searchedBooks` state by the matching id
    const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

    // Get token
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const response = await saveBook({
        variables: { input: bookToSave },
      });

      if (!response) {
        throw new Error("🚫 Something Went Wrong! 🚫");
      }

      // If book successfully saves to user's account, save book id to state
      setSavedBookIds([...savedBookIds, bookToSave.bookId]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div fluid className="text-warning bg-secondary p-5">
        <Container>
          <h1 className=" text-center">📚 Find A Book! 📚</h1>
          <Form onSubmit={handleFormSubmit}>
            <Form.Row className="justify-content-center">
              <Col xs={12} md={8}>
                <Form.Control
                  name="searchInput"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type="text"
                  size="lg"
                  placeholder="Enter book name"
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type="submit" variant="success" size="lg" className="col-12">
                  Find
                </Button>
              </Col>
            </Form.Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className="text-center">
          {searchedBooks.length
            ? `${searchedBooks.length} results:`
            : "Find A Book"}
        </h2>
        <CardColumns>
          {searchedBooks.map((book) => {
            return (
              <Card key={book.bookId} border="dark">
                {book.image ? (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                ) : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <a href={"https://books.google.com/books?id=" + `${book.bookId}`}>
                    Link to Google Books
                  </a>
                  <br></br>
                  <br></br>
                  <br></br>
                  {Auth.loggedIn() && (
                    <Button
                      disabled={savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )}
                      className="btn-block btn-info"
                      onClick={() => handleSaveBook(book.bookId)}
                    >
                      {savedBookIds?.some(
                        (savedBookId) => savedBookId === book.bookId
                      )
                        ? "This book has already been saved! ✅"
                        : "Save this Book! 🎯"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SearchBooks;
