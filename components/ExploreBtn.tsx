"use client";
import Image from "next/image";
import React from "react";

const ExploreBtn = () => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => console.log("clicked")}
    >
      <a href="#events">
        Explore Events
        <Image
          src="/icons/arrow-down.svg"
          alt="Arrow Down"
          width={24}
          height={24}
        />
      </a>
    </button>
  );
};

export default ExploreBtn;
