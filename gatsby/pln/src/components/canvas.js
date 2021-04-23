// we create a React context with a _null_ default value
const SharingContext = React.createContext(null);

const Canvas = (props) => {
  const canvasRef = React.useRef(null);
  const [
    renderingContext,
    setRenderingContext,
  ] = React.useState(null);

  // the canvas rendering context is not immediately avalaible
  // the canvas node first needs to be added to the DOM by react
  React.useEffect(() => {
    const context2d = canvasRef.current.getContext("2d");
    setRenderingContext(context2d);
  }, []);

  return (
    <SharingContext.Provider value={renderingContext}>
      <canvas ref={canvasRef} />
      {/* hexagons are passed through the `children` prop */}
      {props.children}
    </SharingContext.Provider>
  );
};
