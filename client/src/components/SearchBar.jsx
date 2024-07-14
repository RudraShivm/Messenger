import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux';
import { Form, useLocation, useNavigation, useSubmit } from 'react-router-dom'
import { updateSearch } from '../actions/user';

function SearchBar({searching, s}) {
  const location = useLocation();
  const navigation = useNavigation();
  const submit=useSubmit();
  const dispatch = useDispatch();
  const handleSearchChange = (e) => {
    console.log("a");
    const isFirstSearch = s == null;
    submit(e.currentTarget.form, {
      replace: !isFirstSearch,
    });
    dispatch(updateSearch(e.currentTarget.value));
  };
  useEffect(() => {
    document.getElementById("s").value = s;
  }, [s, navigation.location]);

  return (
    <div className="w-full flex justify-center mt-4">
            <Form
              role="search"
              action={`${location.pathname}`}
              className="w-11/12 flex flex-row pl-3 py-1 bg-[#3a3b3c] rounded-xl"
            >
                <svg
                  width="28px"
                  height="28px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="pt-2"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    {" "}
                    <path
                      d="M15 15L21 21"
                      stroke="#B1B7AE"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>{" "}
                    <path
                      d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                      stroke="#B1B7AE"
                      strokeWidth="2"
                    ></path>{" "}
                  </g>
                </svg>
                <input
                  id='s'
                  aria-label="Search user"
                  placeholder="Search Messenger"
                  type="search"
                  name="s"
                  defaultValue={s}
                  onChange={handleSearchChange}
                  className={`lg:text-lg md:text-base text-white leading-1 w-10/12 py-1 px-2 rounded-lg  bg-[#3a3b3c] focus:outline-none ${
                    searching ? "loading" : ""
                  }`}
                />
            </Form>
          </div>
  )
}

export default SearchBar