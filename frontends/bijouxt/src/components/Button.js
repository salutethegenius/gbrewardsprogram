import '../css/button.css'

const Button = ({ handleClick, style, className, children }) => {
    return (
        <button
            onClick={handleClick}
            style={{...style}}
            className={className}
        >{children}</button>
    );
}

export default Button;