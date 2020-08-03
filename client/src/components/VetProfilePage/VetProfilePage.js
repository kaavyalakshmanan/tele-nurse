import React, {useEffect, useState} from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons
import Camera from "@material-ui/icons/Camera";
import EventIcon from "@material-ui/icons/Event";
import MailIcon from "@material-ui/icons/Mail";


// core components
import Button from "../../third-party-assets-material-ui/components/CustomButtons/Button.js";
import GridContainer from "../../third-party-assets-material-ui/components/Grid/GridContainer.js";
import GridItem from "../../third-party-assets-material-ui/components/Grid/GridItem.js";
import NavPills from "../../third-party-assets-material-ui/components/NavPills/NavPills.js";
import Parallax from "../../third-party-assets-material-ui/components/Parallax/Parallax.js";

import styles from "../../third-party-assets-material-ui/jss/material-kit-react/views/profilePage.js";
import Header from "./Header/Header";
import HeaderLinks from "./Header/HeaderLinks";
import Booking from "./Booking/Booking";
import {addVetImageData, getVetById} from "../../actions";
import {useDispatch, useSelector} from "react-redux";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import CardMedia from "@material-ui/core/CardMedia";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

styles['cardMedia'] = {paddingTop: '56.25%'}
const useStyles = makeStyles(styles);

export default function VetProfilePage({vet, auth, id}) {
    const classes = useStyles();
    const loggedInVet = useSelector(state => state.loggedInVet);
    const dispatch = useDispatch();
    const imageClasses = classNames(
        classes.imgRaised,
        classes.imgRoundedCircle,
        classes.imgFluid
    );
    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false);
    const [photoUploadAction, setPhotoUploadAction] = React.useState(null);
    const [preview, setPreview] = React.useState(null);
    const navImageClasses = classNames(classes.imgRounded, classes.imgGallery);
    useEffect(() => {
        if (auth && id) {
            dispatch(getVetById(id));
        }
    }, [])
    const currentVet = vet ? vet : loggedInVet;
    console.log(currentVet);

    const handlePreview = (e) => {
        if (e.target.files) {
            const reader = new FileReader();
            reader.addEventListener('load', (event) => {
                setPreview(event.target.result);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    }

    const handleClose = () => {
        setUploadDialogOpen(false);
        setPreview(null);
    };

    const handleSubmit = (e) => {
        if (preview) {
            dispatch(addVetImageData(photoUploadAction, preview));
        }
        handleClose();
    }

    const handleAddPhoto = (e) => {
        setPhotoUploadAction('PICTURE');
        setUploadDialogOpen(true);
    }

    const handleAddProfilePicture = (e) => {
        setPhotoUploadAction('PROFILE_PICTURE');
        setUploadDialogOpen(true);
    }

    return (
        <div>
            <Header
                color="transparent"
                brand="Tele Vet"
                rightLinks={<HeaderLinks auth={auth}
                                         id = {currentVet._id ? currentVet._id : id}
                                         handleAddPhoto={handleAddPhoto}
                                         handleAddProfilePicture={handleAddProfilePicture}
                />}
                fixed
                changeColorOnScroll={{
                    height: 200,
                    color: "white"
                }}/>
            <Parallax small filter image={ currentVet.coverPhoto } />
            <div className={classNames(classes.main, classes.mainRaised)}>
                <div>
                    <div className={classes.container}>
                        <GridContainer justify="center">
                            <GridItem xs={12} sm={12} md={6}>
                                <div className={classes.profile}>
                                    <div>
                                        <img
                                            alt="..."
                                            className={imageClasses}
                                            src={ currentVet.profilePicture }
                                            style={{"max-width": "300px"}}
                                        />                                    </div>
                                    <div className={classes.name}>
                                        <h3 className={classes.title}>{currentVet.businessName }</h3>
                                    </div>
                                </div>
                            </GridItem>
                        </GridContainer>
                        <div className={classes.description}>
                            <p>
                                { currentVet.description }
                            </p>
                        </div>
                        <GridContainer justify="center">
                            <GridItem xs={12} sm={12} md={8} className={classes.navWrapper}>
                                <NavPills
                                    alignCenter
                                    color="primary"
                                    tabs={[
                                        {
                                            tabButton: "Photos",
                                            tabIcon: Camera,
                                            tabContent: (
                                                <GridContainer justify="center">
                                                    <GridItem xs={12} sm={12} md={4}>
                                                    { currentVet.pictures.map((imgSrc, index) => {
                                                        if (index <= 2) {
                                                            return (<img
                                                                alt="..."
                                                                src={imgSrc}
                                                                className={navImageClasses}
                                                            />)
                                                        }
                                                        return null;
                                                    })
                                                    }
                                                    </GridItem>
                                                    <GridItem xs={12} sm={12} md={4}>
                                                        {currentVet.pictures.map((imgSrc, index) => {
                                                            if (index > 2) {
                                                                return (<img
                                                                    alt="..."
                                                                    src={imgSrc}
                                                                    className={navImageClasses}
                                                                />)
                                                            } else {
                                                                return null;
                                                            }
                                                        })
                                                        }
                                                    </GridItem>
                                                </GridContainer>
                                            )
                                        },
                                        {
                                            tabButton: "Appointments",
                                            tabIcon: EventIcon,
                                            tabContent: (
                                                <GridContainer justify="center">
                                                    <Booking/>
                                                </GridContainer>
                                            )
                                        },
                                        {
                                            tabButton: "Contact",
                                            tabIcon: MailIcon,
                                            tabContent: (
                                                <GridContainer justify="center">
                                                    <GridItem xs={12} sm={12} md={4}>
                                                        <Button color="google" href={currentVet.email}>
                                                            <i
                                                                className={" fab fa-google-plus-square"}
                                                            />{" "}
                                                            Email Us
                                                        </Button>
                                                        <Button color="twitter" href={currentVet.twitter}>
                                                            <i
                                                                className={"fab fa-twitter"}
                                                            />{" "}
                                                            Connect with Twitter
                                                        </Button>
                                                        <Button color="facebook" href={currentVet.facebook}>
                                                            <i
                                                                className={" fab fa-facebook-square"}
                                                            />{" "}
                                                            Connect on Facebook
                                                        </Button>
                                                    </GridItem>
                                                </GridContainer>
                                            )
                                        }
                                    ]}
                                />
                            </GridItem>
                        </GridContainer>
                    </div>
                </div>
            </div>
            <Dialog open={uploadDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Upload a Photo</DialogTitle>
                <DialogContent>
                    <CardMedia
                        className={ classes.cardMedia }
                        image={ preview }
                        title={ 'preview' }
                    />
                    <DialogContentText>
                        Upload a new photo
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Upload
                    </Button>
                    <Button color="primary"
                            variant="contained"
                            component="label"
                    >
                        Browse
                        <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={ handlePreview }
                        />
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
