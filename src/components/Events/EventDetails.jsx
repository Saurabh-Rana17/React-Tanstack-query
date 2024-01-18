import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../utils/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => {
      return fetchEvent({ signal, id });
    },
    staleTime: 5000,
  });

  const {
    mutate,
    isPending: mutatePending,
    isError: mutateError,
    error: deleteError,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDeleting() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleClick() {
    mutate({ id });
  }

  let formattedDate;
  if (data) {
    formattedDate = new Date(data.date).toLocaleDateString("en-us", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure ?</h2>
          <p>
            Do you really want to delete this event. This action cannot be
            undone
          </p>
          {mutatePending && <p>Deleting, Please wait...</p>}
          {!mutatePending && (
            <div className="form-actions">
              <button className="button-text" onClick={handleStopDelete}>
                Cancel
              </button>
              <button className="button" onClick={handleClick}>
                Delete
              </button>
            </div>
          )}
          {mutateError && (
            <ErrorBlock
              message={deleteError.info?.message}
              title="Failed to delete event"
            />
          )}
        </Modal>
      )}

      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      <>
        <article id="event-details">
          {isError && (
            <div id="event-details-content" className="center">
              <ErrorBlock
                message={error.info?.message || "Failed to fetch event"}
                title="Failed to fetch event"
              />
            </div>
          )}
          {isPending && (
            <div id="event-details-content" className="center">
              <p>loading event...</p>
            </div>
          )}
          {data && (
            <>
              <header>
                <h1>{data.title}</h1>

                <nav>
                  <button onClick={handleStartDeleting}>Delete</button>
                  <Link to="edit">Edit</Link>
                </nav>
              </header>
              <div id="event-details-content">
                <img
                  src={`http://localhost:3000/${data.image}`}
                  alt={data.title}
                />
                <div id="event-details-info">
                  <div>
                    <p id="event-details-location">{data.location}</p>
                    <time dateTime={`Todo-DateT$Todo-Time`}>
                      {formattedDate} @ {data.time}
                    </time>
                  </div>
                  <p id="event-details-description"> {data.description} </p>
                </div>
              </div>
            </>
          )}
        </article>
      </>
    </>
  );
}
