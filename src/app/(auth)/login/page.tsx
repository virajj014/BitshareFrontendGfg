"use client"
import React from 'react'
import styles from '@/styles/auth.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { AppDispatch, useAppSelector } from '@/redux/store';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { logIn, logOut } from '@/redux/features/auth-slice';
import axios from 'axios';

interface FormData {

  email: string;
  password: string;
}


const Page = () => {
  const router = useRouter()
  const auth = useAppSelector((state) => state.authReducer)
  const dispatch = useDispatch<AppDispatch>()

  const [formData, setFormData] = React.useState<FormData>({

    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleLogin = async () => {
    if (formData.email == '' || formData.password == '') {
      toast.error('Please fill all the fields')
      return
    }

    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password
      }),
      headers: {
        'Content-Type': 'application/json',
        // allow access control origin
        'Access-Control-Allow-Origin': '*'
      },
      credentials: 'include'
    })

    let data = await res.json()
    if (data.ok) {
      // console.log(data.data)
      // localStorage.setItem('authToken', data.data.authToken)
      // localStorage.setItem('refreshToken', data.data.refreshToken)
      toast.success('Login Success')
      getUserData()
    }
    else {
      toast.error(data.message)
    }
  }
  const getUserData = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // allow access control origin
        'Access-Control-Allow-Origin': '*'
      },
      credentials: 'include'
    })
    let data = await res.json()
    if (data.ok) {
      dispatch(logIn(data.data))
      router.push('/myfiles')

    }
    else {
      dispatch(logOut())
    }
  }


  return (
    <div className={styles.authpage}>
      <div className={styles.authcontainer}>
        <h1>Login</h1>
        <div className={styles.inputcontaner}>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <div className={styles.inputcontaner}>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" id="password" value={formData.password} onChange={handleInputChange} />
        </div>

        <button
          className={styles.button1}
          type="button"
          onClick={handleLogin}
        >Login</button>

        <Link href="/forgotpassword">
          Forgot Password?
        </Link>
      </div>
    </div>
  )
}

export default Page