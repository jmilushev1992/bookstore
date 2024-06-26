/* eslint-disable linebreak-style */
// eslint-disable-next-line no-multiple-empty-lines

import React, { useState, useEffect } from 'react';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import Error from 'next/error';
import Link from 'next/link';
import Button from '@mui/material/Button';

import { getBookDetailApiMethod, syncBookContentApiMethod } from '../../lib/api/admin';
import withAuth from '../../lib/withAuth';
import notify from '../../lib/notify';

/**
 * Prop types for BookDetail component.
 */
const propTypes = {
  slug: PropTypes.string.isRequired,
};

/**
 * Component for displaying book details.
 * @param {Object} props - Component props.
 * @returns {JSX.Element} - BookDetail component.
 */
const BookDetail = ({ slug }) => {
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getBookDetail = async () => {
      NProgress.start();

      try {
        const bookFromServer = await getBookDetailApiMethod({ slug });
        setBook(bookFromServer);
      } catch (err) {
        setError(err.message || err.toString());
      } finally {
        NProgress.done();
      }
    };

    getBookDetail();
  }, []);

  /**
   * Function to handle syncing book content with Github.
   */
  const handleSyncContent = async () => {
    const bookId = book._id;

    try {
      await syncBookContentApiMethod({ bookId });
      notify('Synced');
    } catch (err) {
      notify(err);
    }
  };

  if (error) {
    notify(error);
    return <Error statusCode={500} />;
  }

  if (!book) {
    return null;
  }

  const { chapters = [] } = book;

  return (
    <div style={{ padding: '10px 45px' }}>
      <h2>{book.name}</h2>
      <a href={`https://github.com/${book.githubRepo}`} target="_blank" rel="noopener noreferrer">
        Repo on Github
      </a>
      <p />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSyncContent}
        style={{ marginRight: '20px' }}
      >
        Sync with Github
      </Button>
      <Link href={`/admin/edit-book?slug=${book.slug}`} as={`/admin/edit-book/${book.slug}`}>
        <Button variant="contained" color="primary">
          Edit book
        </Button>
      </Link>
      <ul>
        {chapters.map((ch) => (
          <li key={ch._id}>
            <Link
              as={`/books/${book.slug}/${ch.slug}`}
              href={`/public/read-chapter?bookSlug=${book.slug}&chapterSlug=${ch.slug}`}
            >
              {ch.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Fetches initial props for BookDetail component.
 * @param {Object} context - Context object.
 * @returns {Object} - Initial props.
 */
BookDetail.getInitialProps = async ({ query }) => {
  return { slug: query.slug };
};

BookDetail.propTypes = propTypes;

// Wrap BookDetail component with authentication requirement (admin)
export default withAuth(BookDetail, { adminRequired: true });
