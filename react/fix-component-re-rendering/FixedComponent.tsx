import React, { FC, useState, useRef, useCallback, memo } from 'react';

interface INameProps {
  id: number;
  name: string;
  isDisabled: boolean;
  onClick: (id: number) => void;
}

const Name: FC<INameProps> = memo(({ id, name, isDisabled, onClick }) => {
  console.log(`fixed rendered ${name}`);

  return (
    <button
      disabled={isDisabled}
      className="item"
      onClick={() => onClick(id)}
    >
      {name}
      <span className="clear">x</span>
    </button>
  );
});

export const FixedComponent = () => {
  const [names, setNames] = useState([
    {id: 1, name: '1', isDisabled: true},
    {id: 2, name: '2'},
    {id: 3, name: '3'},
    {id: 4, name: '4'},
    {id: 5, name: '5'},
  ]);
  const nextId = useRef(6);
  const refName = useRef<HTMLInputElement | null>(null);

  const handleClear = useCallback(
    (id) => {
      setNames(names => names.filter((item) => item.id !== id));
    },
    []
  );

  const handleAdd = (event) => {
    event.preventDefault();
    const value = refName.current?.value?.trim();
    if (!value) return;
    setNames(prevNames => [
      {
        id: nextId.current,
        name: value,
      },
      ...prevNames
    ]);
    nextId.current += 1;
    if (refName.current) refName.current.value = '';
  };

  return (
    <div className="App">
      <h1>Fixed</h1>

      {names.map(({id, name, isDisabled = false}) => (
        <Name
          key={id}
          id={id}
          name={name}
          isDisabled={isDisabled}
          onClick={handleClear}
        />
      ))}

      <form onSubmit={(event) => handleAdd(event)}>
        <input ref={refName} />
        <button>Add</button>
      </form>
    </div>
  );
};
