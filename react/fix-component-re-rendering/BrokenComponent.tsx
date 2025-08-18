import React, { FC, useState, useRef, useCallback } from 'react';

interface INameProps {
  item: { name: string; isDisabled: boolean };
  onClick: (name: string) => void;
}

const Name: FC<INameProps> = ({ item, onClick }) => {
  const { isDisabled, name } = item;
  console.log(`broken rendered ${name}`);

  return (
    <button
      disabled={isDisabled}
      className="item"
      onClick={() => onClick(name)}
    >
      {name}
      <span className="clear">x</span>
    </button>
  );
};

export const BrokenComponent = () => {
  const [names, setNames] = useState(['1', '2', '3', '4', '5']);
  const refName = useRef(null);

  const handleClear = useCallback(
    (name) => {
      setNames(names.filter((currentName) => currentName !== name));
    },
    [names]
  );

  const handleAdd = (event) => {
    event.preventDefault();
    setNames([refName.current.value, ...names]);
    refName.current.value = '';
  };

  return (
    <div className="App">
      <h1>Broken</h1>

      {names.map((name, index) => (
        <Name
          key={index}
          item={{ name, isDisabled: index === 0 }}
          onClick={(name) => handleClear(name)}
        />
      ))}

      <form onSubmit={(event) => handleAdd(event)}>
        <input ref={refName} />
        <button>Add</button>
      </form>
    </div>
  );
};
