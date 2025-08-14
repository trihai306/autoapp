import Side from './Side'
// import Simple from './Simple'
// import Split from './Split'

const AuthLayout = ({ children }) => {
    // Note: As 'side' is the only layout used, we can directly use it.
    // If you need to switch layouts dynamically in the future,
    // you can uncomment the other imports and use a switch statement
    // or an object mapping like below.
    //
    // const layouts = {
    //    simple: Simple,
    //    split: Split,
    //    side: Side,
    // }
    // const currentLayoutType = 'side'
    // const Layout = layouts[currentLayoutType]

    return <Side>{children}</Side>
}

export default AuthLayout
