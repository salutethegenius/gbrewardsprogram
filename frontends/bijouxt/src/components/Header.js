import { useEffect, useState } from "react";
import Company from "../utilities/Company";
import Button from "./Button";
import Flexbox from "./Flexbox";
import cookies from "../utilities/Cookies";
import { useNavigate } from "react-router-dom";

const Header = () => {
    const navigate = useNavigate()
    const [path, setPath] = useState('')

    const Logout = () => {
        cookies.deleteCookies('admin-token')
        navigate('/admin')
    }

    useEffect(() => {
        setPath(window.location.href)
        //eslint-disable-next-line
    }, [])
    return (
        <div className="header">
            <Flexbox alignItems="center" justifyContent="space-between" style={{padding: '20px'}}>
                <img src="/logo.png" alt="logo" style={{width: '150px'}} />
                {path.includes("/admin") && <Button style={{border: '1px solid var(--primary)', borderRadius: '20px', padding: '10px 15px', color: 'var(--primary)', background: 'transparent'}} handleClick={() => Logout()} className="hide-on-med-and-down">
                    Logout →
                </Button>}
                {(!path.includes('/dashboard') || !path.includes('/admin')) && <Button style={{border: '1px solid var(--primary)', borderRadius: '20px', padding: '10px 15px', color: 'var(--primary)', background: 'transparent'}} handleClick={() => {
                    window.location.href = 'mailto:' + Company.email
                }} className="hide-on-med-and-down">
                    Help
                </Button>}
                {(path.includes('/dashboard') && !path.includes('/admin')) && <Button style={{border: '1px solid var(--primary)', borderRadius: '20px', padding: '10px 15px', color: 'var(--primary)', background: 'transparent'}} handleClick={() => {
                    cookies.deleteCookies('token')
                    navigate('/')
                }} className="hide-on-med-and-down">
                    Logout →
                </Button>}
            </Flexbox>
        </div>
    );
}
 
export default Header;