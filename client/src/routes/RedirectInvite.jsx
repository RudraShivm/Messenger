import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function RedirectInvite() {
  const navigate = useNavigate();
  const { inviteId } = useParams();
  useEffect(() => {
    navigate("/home/addPanel", { state: { inviteId } });
  }, []);

  return <div></div>;
}

export default RedirectInvite;
