const Grid = ({children, grid, className, gap}) => {
    return (
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${grid}, 1fr)`, gap: `${gap}`}} className={className+" custom-grid"}>
            {children}
        </div>
    );
}
 
export default Grid;