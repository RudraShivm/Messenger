import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Form, useLocation, useNavigation, useSubmit } from "react-router-dom";
import SearchIcon from "./svgs/searchIcon.svg?react";
import { updateSearch } from "../actions/user";

function SearchBar({ searching, s }) {
  const location = useLocation();
  const navigation = useNavigation();
  const submit = useSubmit();
  const dispatch = useDispatch();
  const handleSearchChange = (e) => {
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
        <SearchIcon />
        <input
          id="s"
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
  );
}

export default SearchBar;
