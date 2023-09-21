import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import style from "../../assets/styles/Modal.module.css";
import { getAllContactList } from "../../Services/fetchContactDetails";
import Spinner from "react-bootstrap/Spinner";
import ContactDetailsModal from "../ModalC/ContactDetailsModal";
import Form from "react-bootstrap/Form";
import Scrollbars from "react-custom-scrollbars";

let debounceTimeout;

function ModalA({ showModalA, setShowModalA, setActiveTab, setShowModalB }) {
  // contacts_ids, contacts
  const [loading, setLoading] = useState(false);
  const [onlyEven, setOnlyEven] = useState(false);
  const [evenFilteredId, setEvenFilteredId] = useState([]);
  const [showModalC, setShowModalC] = useState(false);
  const [currentContactDetails, setCurrentContactDetails] = useState({});
  const [contactIdList, setConstactIdList] = useState([]);
  const [contactDetails, setConatctDetails] = useState(null);
  const [queryText, setQueryText] = useState("");
  const [loadingOnScroll, setLoadingOnScroll] = useState(false);

  const totalPage = useRef(null);
  const currentPage = useRef(1);

  const handleClose = () => {
    // if (!loading) {
    setShowModalA(false);
    window.history.pushState(null, "", "/");
    // }
  };

  // Handle input change with debouncing
  const handleQueryTextChange = (e) => {
    currentPage.current = 1;
    const newQuery = e.target.value;
    setQueryText(newQuery);
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      searchAPI(newQuery);
    }, 2000);
  };

  // handle input Enter key
  const handleEnterKey = (e) => {
    if (!loading) {
      if (e.key === "Enter") {
        clearTimeout(debounceTimeout);
        searchAPI(queryText);
      }
    }
  };

  // Function to make the API call
  async function searchAPI(query) {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      // setOnlyEven(false);
      const response = await getAllContactList({ query: query });
      totalPage.current = response.total;
      setConatctDetails(response.contacts);
      setConstactIdList(response.contacts_ids);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const getAllContactLists = async () => {
    if (loading) {
      return;
    }
    try {
      setLoading(true);
      // setOnlyEven(false);
      const contactData = await getAllContactList({});
      console.log(contactData);
      totalPage.current = contactData.total;
      setConatctDetails(contactData.contacts);
      setConstactIdList(contactData.contacts_ids);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onScrollLoadData = async (query) => {
    if (totalPage.current && totalPage.current <= currentPage.current) {
      return;
    }
    setLoadingOnScroll(true);
    // setOnlyEven(false);
    try {
      currentPage.current += 1;
      const response = await getAllContactList({
        query: query,
        page: currentPage.current,
      });

      setConatctDetails((old) => {
        return { ...old, ...response.contacts };
      });
      setConstactIdList((old) => {
        return [...old, ...response.contacts_ids];
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingOnScroll(false);
    }
  };

  useEffect(() => {
    // initial loading data
    getAllContactLists();
    return () => {
      // clearing state data
      setConstactIdList([]);
    };
  }, []);

  useEffect(() => {
    if (onlyEven) {
      const filterData = contactIdList.filter((item) => {
        return parseInt(item) % 2 === 0;
      });
      setEvenFilteredId([...filterData]);
    } else {
      setEvenFilteredId([]);
    }
  }, [onlyEven, contactIdList]);

  return (
    <>
      {showModalC && (
        <ContactDetailsModal
          showModalC={showModalC}
          setShowModalC={setShowModalC}
          data={currentContactDetails}
        />
      )}

      <Modal show={showModalA} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Modal A</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ height: "550px", overflowY: "hidden" }}>
          <div className={`${style.modalButtonDiv}`}>
            <Button
              style={{
                backgroundColor: "var(--buttonAColor)",
                borderColor: "transparent",
              }}
              onClick={() => {
                window.history.pushState(null, "", "/modal-a");
              }}
            >
              All Contacts
            </Button>
            <Button
              style={{
                backgroundColor: "var(--buttonBColor)",
                borderColor: "transparent",
              }}
              onClick={() => {
                setActiveTab(2);
                setShowModalA(false);
                setShowModalB(true);
                window.history.pushState(null, "", "/modal-b");
              }}
            >
              US Contacts
            </Button>
            <Button
              onClick={handleClose}
              style={{
                backgroundColor: "white",
                borderColor: "var(--buttonAColor)",
                color: "black",
              }}
            >
              Close
            </Button>
          </div>
          {/* Search Input field */}
          <div style={{ margin: "20px 0px" }}>
            <Form.Label htmlFor="inputText">Search</Form.Label>
            <Form.Control
              type="text"
              id="inputText"
              value={queryText}
              onChange={handleQueryTextChange}
              onKeyDown={handleEnterKey}
            />
          </div>
          {/* Display Loading data */}
          {loading && (
            <div className={style.conatctListBody}>
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
          {/* Display No Data Found! */}
          {!loading && contactIdList.length === 0 && <div>No Data Found!</div>}

          {/* Implementing Scrollbars library */}
          <Scrollbars
            style={{ width: "100%", height: "360px" }}
            onScroll={(values) => {
              const { scrollTop, scrollHeight, clientHeight } = values.target;
              if (
                scrollTop + clientHeight >= scrollHeight - 5 &&
                !loadingOnScroll &&
                !loading
              ) {
                onScrollLoadData(queryText);
              }
            }}
          >
            {/* Display Contact Id's in Button */}
            <div className={!loading ? style.conatctListBody : ""}>
              {!loading &&
                evenFilteredId.length === 0 &&
                contactIdList.map((item) => {
                  return (
                    <Button
                      style={{
                        backgroundColor: `${
                          contactDetails[item]?.color
                            ? `${contactDetails[item]?.color}`
                            : ""
                        }`,
                      }}
                      onClick={() => {
                        setCurrentContactDetails(contactDetails[item]);
                        setShowModalC(true);
                      }}
                      key={item}
                    >
                      {item}
                    </Button>
                  );
                })}

              {/* Display onlyEven contact Id's data */}
              {!loading &&
                evenFilteredId.map((item) => {
                  return (
                    <Button
                      style={{
                        backgroundColor: `${
                          contactDetails[item]?.color
                            ? `${contactDetails[item]?.color}`
                            : ""
                        }`,
                      }}
                      key={item}
                      onClick={() => {
                        setCurrentContactDetails(contactDetails[item]);
                        setShowModalC(true);
                      }}
                    >
                      {item}
                    </Button>
                  );
                })}
            </div>
          </Scrollbars>
          {/* Display Loading on Scroll */}
          {loadingOnScroll && (
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
        </Modal.Body>

        <Modal.Footer>
          {/* Checkbox for only even items for filtering data  */}
          <div className={`${style.footerCheckBox}`}>
            <input
              type="checkbox"
              name="onlyeven"
              id="onlyEven"
              value={onlyEven}
              onChange={(e) => {
                setOnlyEven(e.target.checked);
              }}
            />
            <label htmlFor="onlyEven" style={{ margin: "0px 0px 2px 0px" }}>
              Only Even
            </label>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalA;
