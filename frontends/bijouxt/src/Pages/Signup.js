import { isMobile } from "react-device-detect";
import Flexbox from "../components/Flexbox";
import Header from "../components/Header";
import Toast from "../components/Toast";
import Footer from "../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import cookies from "../utilities/Cookies";
import { Container, IconButton } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material"
import Spacebox from "../components/Spacebox";
import Button from "../components/Button";
import requests from "../handlers/requests";
import Company from "../utilities/Company";
import { useDispatch } from "react-redux";
import { updateuser } from "../features/users";

const Signup = ({ title }) => {
    document.querySelector('title').innerHTML = title

    const { email } = useParams()

    const [loading, setLoading] = useState(false)

    const inputHolderRef = useRef(null)

    const [input, setInput] = useState('')
    const [inputs, setInputs] = useState('')

    const variables = [
        { title: 'fullname', placeholder: 'Type here', heading: 'Your Full Name', type: 'text', helper: 'Enter your full name' },
        { title: 'phone', placeholder: 'Type here', heading: 'Your Phone Number', type: 'number', helper: 'Phone number should include your country code. E.g +15466754212' },
        { title: 'password', placeholder: 'Type here', heading: 'Set Password', type: 'text', helper: 'Password should be 8 characters or more' },
        { title: 'confirm', placeholder: 'Type here', heading: 'Confirm Password', text: 'text', helper: '' },
    ]
    const lenVar = 4


    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState('success');
    const [msg, setToastMsg] = useState('');

    const [steps, setSteps] = useState(0)

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleBack = () => {
        if (steps === 0) {
            // go back to login
            navigate('/', { replace: true })
        } else {
            inputHolderRef.current.classList.add('disapear') // slow hide the div holding the input
            setTimeout(() => {
                let arr = [...inputs]
                let counter = steps - 1
                setSteps(counter) // go back one step
                setInput(Object.values(arr[counter]).toString()) // set value of previous step into input
                //delete the particular variable 
                delete arr[counter]
                setInputs(arr.filter(ar => ar !== undefined))
                inputHolderRef.current.classList.remove('disapear')
            }, 1000);
        }
    }

    const submit = (data) => {
        setLoading(true)

        //convert arr of obj to obj of objs
        let objs = {}
        for (let i in data)
            objs[Object.keys(data[i]).toString()] = Object.values(data[i]).toString()

        console.log(objs)
        const url = `${process.env.REACT_APP_SERVER}api/signup?api_token=${process.env.REACT_APP_API_TOKEN}&sid=${Company.store_id}`
        requests.makePost(url, { ...objs, email: email }, setOpen, setSeverity, setToastMsg, setLoading,
            (res) => {
                cookies.setCookies('user', JSON.stringify(res.user), 5)
                cookies.setCookies('token', res.token, 0.5)
                dispatch(updateuser(res.user))
                setTimeout(() => {
                    navigate('/dashboard')
                }, 2000);
            },
            "Account created successfully"
        )
    }

    const evaluateClick = () => {
        if (input !== '') {
            if (steps === lenVar - 1) {
                // final step
                if (Object.values(inputs[steps - 1]).toString() === input) {
                    let obj = {} //create empty object
                    obj[variables[steps].title] = input // add value to property of variable 
                    let arr = [...inputs, obj]
                    setInputs(arr)
                    submit(arr)
                } else {
                    setToastMsg("Password mismatch")
                    setSeverity("error")
                    setOpen(true)
                }
            } else {
                if (variables[steps].title === 'password') {
                    if (input.length > 7) {
                        let obj = {} //create empty object
                        obj[variables[steps].title] = input // add value to property of variable 
                        let arr = [...inputs, obj]
                        setInputs(arr)
                        inputHolderRef.current.classList.add('disapear') // slow hide the div holding the input
                        setTimeout(() => {
                            setInput("") // clear value of input
                            let counter = steps
                            setSteps(counter + 1) // go to the next step
                            inputHolderRef.current.classList.remove('disapear')
                        }, 1000);
                    } else {
                        setToastMsg("Password too short")
                        setSeverity("error")
                        setOpen(true)
                    }
                } else {
                    let obj = {} //create empty object
                    obj[variables[steps].title] = input // add value to property of variable 
                    let arr = [...inputs, obj]
                    setInputs(arr)
                    inputHolderRef.current.classList.add('disapear') // slow hide the div holding the input
                    setTimeout(() => {
                        setInput("") // clear value of input
                        let counter = steps
                        setSteps(counter + 1) // go to the next step
                        inputHolderRef.current.classList.remove('disapear')
                    }, 1000);
                }
            }
        } else {
            setToastMsg("Provide valid value")
            setSeverity("error")
            setOpen(true)
        }
    }


    useEffect(() => {
        let token = cookies.getCookies('token')
        // 10 is a random number 
        if (token.length > 10) {
            navigate('/dashboard')
        }
        //eslint-disable-next-line
    }, [])

    return (
        <div className="signup-page">
            <Header />
            <Toast open={open} setOpen={setOpen} severity={severity} timer={4000}>{msg}</Toast>
            <Container>
                <Flexbox justifyContent="flex-start" alignItems="center" style={{ height: isMobile ? '70vh' : '70vh' }}>
                    <div ref={inputHolderRef}>
                        <IconButton onClick={() => handleBack()}>
                            <ChevronLeft />
                        </IconButton>
                        <Spacebox padding="10px" />
                        <Spacebox padding="0px 20px">
                            <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 'Futstat-SemiBold' }}>{variables[steps].heading}</span>
                            <input
                                type={variables[steps].type}
                                className="borderless-input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={variables[steps].placeholder}
                                style={{ fontSize: isMobile ? 50 : 70 }}
                            />
                            <Spacebox padding="2px" />
                            <small style={{ opacity: .6, fontSize: isMobile ? 10 : 13 }} >{variables[steps].helper}</small>
                            <Spacebox padding="10px" />
                            <Button className="bold" handleClick={() => evaluateClick()} style={{ background: 'var(--primary)', color: 'white', borderRadius: '100px', padding: '15px 40px', fontSize: 15 }}>
                                {loading ? "Please wait" : "Next"}
                            </Button>
                        </Spacebox>
                    </div>
                </Flexbox>
            </Container>
            <Footer />
        </div>
    );
}

export default Signup;