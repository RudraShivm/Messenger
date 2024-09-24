import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Form, useLocation, useNavigation, useSubmit } from "react-router-dom";
import SearchIcon from "./svgs/searchIcon.svg?react";
import { updateCreateGroupSearch, updateHomeSearch } from "../actions/user";

function SearchBar({ s, id }) {
  const [searching, setSearching] = useState(false);
  const location = useLocation();
  const navigation = useNavigation();
  const submit = useSubmit();
  const dispatch = useDispatch();
  const handleSearchChange = (e) => {
    const isFirstSearch = s == null;
    setSearching(true);
    submit(e.currentTarget.form, {
      replace: !isFirstSearch,
    });
    switch (id) {
      case "createGroupSearchTerm":
        dispatch(updateCreateGroupSearch(e.currentTarget.value));
        break;
      case "homeSearchTerm":
        dispatch(updateHomeSearch(e.currentTarget.value));
        break;
      default:
        break;
    }
    setSearching(false);
  };
  useEffect(() => {
    document.getElementById(id).value = s;
  }, [s, navigation.location]);

  return (
    <div className="w-full h-[45px] flex justify-center my-[1rem]">
      <Form
        role="search"
        action={`${location.pathname}`}
        className="w-11/12 flex flex-row pl-3 py-1 bg-[#3a3b3c] rounded-xl"
      >
        <SearchIcon />
        <input
          id={id}
          aria-label="Search user"
          placeholder="Search Messenger"
          type="search"
          name={id}
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
