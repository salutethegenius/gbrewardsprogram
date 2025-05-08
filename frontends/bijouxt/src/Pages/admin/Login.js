import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cookies from "../../utilities/Cookies";
import Toast from "../../components/Toast";
import Flexbox from "../../components/Flexbox";
import { Typography } from "@mui/material";
import Spacebox from "../../components/Spacebox";
import Button from "../../components/Button";
import requests from "../../handlers/requests";
import { updateuser } from "../../features/users";
import { useDispatch } from "react-redux";
import Company from "../../utilities/Company";

const Login = ({ title }) => {
    document.querySelector('title').innerHTML = title

    const [loading, setLoading] = useState(false)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const navigate = useNavigate()
    const dispatch = useDispatch()


    const submit = () => {
        if (email.includes("@") && password !== '') {
            setLoading(true)
            const url = `${process.env.REACT_APP_SERVER}api/admin/signin?api_token=${process.env.REACT_APP_API_TOKEN}&sid=${Company.store_id}`
            requests.makePost(url, { email, password }, setOpen, setSeverity, setToastMsg, setLoading,
                (res) => {
                    cookies.setCookies('admin', JSON.stringify(res.admin), 5)
                    cookies.setCookies('admin-token', res.token, 0.5)
                    dispatch(updateuser(res.admin))
                    navigate(`/admin/dashboard`)
                },
                null
            )
        } else {
            setToastMsg("Invalid entries")
            setSeverity("error")
            setOpen(true)
        }
    }

    useEffect(() => {
        let token = cookies.getCookies('admin-token')
        // 10 is a random number 
        if (token.length > 10) {
            navigate('/admin/dashboard')
        }
        //eslint-disable-next-line
    }, [])

    return (
        <div className="admin-login-page">
            <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
            <Flexbox justifyContent="center" alignItems="center" style={{ height: '100vh', background: '#deeeff' }}>
                <div>
                    <Flexbox justifyContent="center" alignItems="center">
                        <div className="logo">
                            <img src="/logo.png" alt={Company.name} />
                        </div>
                    </Flexbox>
                    <Spacebox padding="10px" />
                    <div style={{ borderRadius: '10px', padding: '40px', boxShadow: '0px 0px 30px #00000010', minWidth: 400, background: 'white' }}>
                        <Typography textAlign="center" className="bold">
                            Sign In
                        </Typography>
                        <Spacebox padding="10px" />
                        <small>
                            Email
                        </small>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Spacebox padding="5px" />
                        <small>
                            Password
                        </small>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Spacebox padding="5px" />
                        <Flexbox justifyContent="flex-end">
                            <Link to="">
                                <small>
                                    Forgot password
                                </small>
                            </Link>
                        </Flexbox>
                        <Spacebox padding="10px" />
                        <Button style={{ background: 'var(--primary)', color: 'white', width: '100%', padding: '15px 20px', borderRadius: '5px' }} handleClick={() => submit()} >
                            {loading ? "Authenticating..." : "Sign in"}
                        </Button>
                    </div>
                </div>
            </Flexbox>
        </div>
    );
}

export default Login;