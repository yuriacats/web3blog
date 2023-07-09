import React from "react";

export const PageHead = ({
  title,
  author,
  date,
}: {
  title: string;
  author: string;
  date: Date;
}): React.ReactElement => {
  return (
    <>
      <h1>{title}</h1>
      <p>{author}</p>
      <p>{date.toLocaleDateString()}</p>
    </>
  );
};
