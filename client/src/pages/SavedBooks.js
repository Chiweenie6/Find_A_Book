import React from "react";
import {
  Container,
  CardColumns,
  Col,
  Card,
  Button,
  Row,
} from "react-bootstrap";
import { Navigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";

import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  // Use the Query "GET_ME"
  const { loading, data } = useQuery(GET_ME);
  // Checks if data is returning from "GET_ME" and saves to "userData"
  let userData = data?.me || {};

  const [removeBook] = useMutation(REMOVE_BOOK);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      const { newData } = await removeBook({
        variables: {
          bookId: bookId,
        },
      });

      if (!newData.ok) {
        throw new Error("🚫 Something went wrong! 🚫");
      }

      // Update user's savedBooks after removing book.
      userData = newData;

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  
  if (loading) {
    return <div>🔃 Loading 🔃</div>;
  }
  if (!userData?.username) {
    return <h2>🚫 Must Be Logged In To View Profile🚫</h2>;
  }

  return (
    <>
      <div
        fluid
        className="text-light bg-dark p-5"
        class="text-center p-5 text-success"
      >
        <Container class="">
          <h1>📔📗 Saved books! 📕📘</h1>
        </Container>
      </div>
      <Container>
        <h2 class="text-center">
          {userData.savedBooks.length
            ? `${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "No saved books!"}
        </h2>
        <Container fluid>
          <Row>
            <CardColumns>
              {userData.savedBooks.map((book) => {
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
                      <a href="https://books.google.com/books?id= + {book.bookId}.value">
                        Link to Google Books
                      </a>
                      <br></br>
                      <br></br>
                      <br></br>
                      <Button
                        className="btn-block btn-danger"
                        onClick={() => handleDeleteBook(book.bookId)}
                      >
                        Delete this Book!
                      </Button>
                    </Card.Body>
                  </Card>
                );
              })}
            </CardColumns>
          </Row>
        </Container>
      </Container>
    </>
  );
};

export default SavedBooks;
