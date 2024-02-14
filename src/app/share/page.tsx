"use client"
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import styles from '@/styles/auth.module.css'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { io } from 'socket.io-client'
import { AppDispatch, useAppSelector } from '@/redux/store'
import { useDispatch } from 'react-redux'
import { logIn, logOut } from '@/redux/features/auth-slice'

let socket: any = null;
let apiurl: string = `${process.env.NEXT_PUBLIC_API_URL}`


const Page = () => {
  const dispatch = useDispatch<AppDispatch>()

  const auth = useAppSelector((state) => state.authReducer)
  const [file, setFile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [fileName, setFileName] = useState('')

  const onDrop = useCallback((acceptedFiles: any) => {
    console.log(acceptedFiles)
    setFile(acceptedFiles[0])

    // Do something with the files
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const removeFile = () => {
    setFile(null)
  }
  const viewFile = () => { }

  const [uploading, setUploading] = useState(false)
  const [uploadpercent, setUploadpercent] = useState(0)

  const Router = useRouter()
  // const handleUpload = async () => {
  //   console.log(email);
  //   console.log(file);
  //   console.log(fileName);

  //   if (!email) {
  //     toast.error('Please fill all the fields');
  //     return;
  //   }
  //   if (!file) {
  //     toast.error('Please select a file');
  //     return;
  //   }


  //   let formdata = new FormData();
  //   formdata.append('receiveremail', email);
  //   formdata.append('filename', fileName);

  //   if (file) {
  //     formdata.append('clientfile', file);
  //   }


  //   setUploading(true);
  //   let req = new XMLHttpRequest();
  //   req.open('POST', process.env.NEXT_PUBLIC_API_URL + '/file/sharefile', true);
  //   req.withCredentials = true;


  //   req.upload.addEventListener('progress', (event) => {
  //     if (event.lengthComputable) {
  //       const percent = (event.loaded / event.total) * 100;
  //       setUploadpercent(Math.round(percent));
  //       console.log(`Upload progress: ${Math.round(percent)}%`);
  //       // You can update the UI with the upload progress if needed
  //     }
  //   });


  //   req.upload.addEventListener('load', () => {
  //     console.log('Upload complete!');
  //     // Handle completion as needed

  //     toast.success('File uploaded successfully');
  //   });
  //   req.upload.addEventListener('error', (error) => {
  //     console.error('Upload failed:', error);
  //     // Handle errors as needed
  //     toast.error('File upload failed');
  //     setUploading(false);

  //   });


  //   req.onreadystatechange = function () {
  //     if (req.readyState === 4) {
  //       setUploading(false);
  //       if (req.status === 200) {
  //         toast.success('File shared successfully');
  //         socket.emit('uploaded', {
  //           from: auth.user.email,
  //           to: email,
  //         })
  //         Router.push('/myfiles');
  //       } else {
  //         toast.error('File upload failed');
  //       }
  //     }
  //   }

  //   req.send(formdata);

  // }
  const generatepostobjecturl = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/generatepostobjecturl', {
      method: 'GET',
      credentials: 'include',
    })
    let data = await res.json()
    if (data.ok) {
      console.log(data.data.signedUrl)
      return data.data
    }
    else {
      toast.error('Failed to generate post object url')
      return null
    }

  }
  const uploadtos3byurl = async (url: any) => {
    setUploading(true);
    const options = {
      method: 'PUT',
      body: file,
    };

    let res = await fetch(url, options)
    if (res.ok) {
      // toast.success('File uploaded successfully');
      return true
    }
    else {
      // toast.error('Failed to upload file')
      return false
    }
  }
  const handleUpload = async () => {
    setUploading(true)

    let s3urlobj = await generatepostobjecturl()
    if (!s3urlobj) {
      setUploading(false)
      return;
    }
    let filekey = s3urlobj.filekey;
    let s3url = s3urlobj.signedUrl
    let uploaded = await uploadtos3byurl(s3url)
    if (!uploaded) {
      setUploading(false)
      return;
    }
    // toast.success('File uploaded successfully')


    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/file/sharefile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        receiveremail: email,
        filename: fileName,
        filekey: filekey,
        fileType: file.type
      })
    })

    let data = await res.json()
    setUploading(false)
    if (data.ok) {
      toast.success('File shared successfully');
      // socket.emit('uploaded', {
      //   from: auth.user.email,
      //   to: email,
      // })
      Router.push('/myfiles');
    }

    else {
      toast.error('Failed to share file')
    }

  }






  // const [socketId, setSocketId] = useState<string>("")
  // socket = useMemo(() => io(apiurl), [])

  const router = useRouter()

  useEffect(() => {
    console.log(auth.isAuth)
    if (!auth.isAuth) {
      return router.push("/login");
    }
  }, [auth]);


  // useEffect(() => {
  //   socket.on('connect', () => {
  //     console.log(socket.id)
  //     setSocketId(socket.id)
  //   })

  //   if (auth.user) { socket.emit('joinself', auth.user.email) }
  //   else {
  //     getuserdata().then((user) => {
  //       socket.emit('joinself', user.email)
  //     })
  //   }



  // }, [])


  const getuserdata = async () => {
    let res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/getuser', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    })

    let data = await res.json()
    if (data.ok) {
      dispatch(logIn(data.data))
      return data.data
    }
    else {

      dispatch(logOut())
      router.push('/login')
    }
  }

  return (
    <div className={styles.authpage}>
      <div className={styles.authcontainer}>
        <div className={styles.inputcontaner}>
          <label htmlFor="email">Receiver&apos;s email</label>
          <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className={styles.inputcontaner}>
          <label htmlFor="filename">File Name</label>
          <input type="text" name="filename" id="filename" value={fileName} onChange={e => setFileName(e.target.value)} />
        </div>


        <div className={styles.inputcontaner}>
          {
            file ?
              <div className={styles.filecard}>
                <div className={styles.left}>
                  <p>{file.name}</p>
                  <p>{(file.size / 1024).toFixed(2)} KB</p>
                </div>

                <div className={styles.right}>

                  <svg
                    onClick={removeFile}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>

                  <svg
                    onClick={viewFile}

                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>

                </div>

              </div>
              :
              <div className={styles.dropzone} {...getRootProps()}>
                <input {...getInputProps()} />
                {
                  isDragActive ?
                    <p>Drop the files here ...</p> :
                    <div className={styles.droptext}>
                      <p>Drag &apos;n&apos; drop some files here</p>
                      <p>or</p>
                      <p>click here to select files</p>
                    </div>
                }
              </div>
          }
        </div>


        <button
          className={styles.button1}
          type="button"
          onClick={handleUpload}
        >Send</button>
      </div>


      {uploading &&
        <div className={styles.uploadpopup}>

          <p>Uploading...</p>

        </div>
      }
    </div>
  )
}

export default Page