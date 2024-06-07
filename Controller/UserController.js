import mongoose from "mongoose";
import EmailVerification from "../model/Emailverification.js";
import SocialMediaLinkModel from "../model/SocialMediaLinkModel.js"
import PasswordReset from "../model/PasswordReset.js"
import Users from "../model/userModel.js";
import { CompareString, hashString, creteJWT } from "../utils/index.js";
import { resetPasswordLink } from "../utils/SendEmail.js";
import FriendsRequest from "../model/FriendRequest.js";
import SocialLinkModel from "../model/SocialMediaLinkModel.js";



const verifyEmail = async (req, res, next) => {
    const { userId, token } = req.params
    console.log(userId, "==userId", token, "token");
    try {

        const result = await EmailVerification.findOne({ userId })
        console.log(result, "==result");
        if (result) {
            const { expires_At, token: hashtoken } = result
            console.log(expires_At, '=====expire', hashtoken);
            if (expires_At < Date.now()) {
                EmailVerification.findOneAndDelete({ userId })
                    .then(() => {
                        Users.findOneAndDelete({ _Id: userId })
                            .then(() => {
                                const message = "Verification token has expired.";
                                res.redirect(`/users/verified?status=error&message=${message}`)
                            })
                            .catch(err => {
                                console.log(err);
                                res.redirect(`/users/verified?status=error&message=`)
                            })
                    })
                    .catch(error => {
                        console.log(error);
                        res.redirect(`/users/verified?message=`)
                    })
            }
            else {
                //token vaild
                CompareString(token, hashtoken).then(isMatch => {
                    if (isMatch) {
                        Users.findOneAndUpdate({ _id: userId }, { verified: true })
                            .then(() => {
                                EmailVerification.findOneAndDelete({ userId })
                                    .then(() => {
                                        const message = "Email verified successfully.";
                                        res.redirect(`/users/verified?status=success&message=${message}`)
                                    })
                                    .catch(err => {
                                        const message = "Email verification is failed or link is invaild.";
                                        res.redirect(`/users/verified?status=error&message=${message}`)
                                    })
                            })
                    }
                    else {
                        const message = "Email verification is failed or link is invaild.";
                        res.redirect(`/users/verified?status=error&message=${message}`)
                    }

                })
                    .catch(err => {
                        console.log(err);
                        res.redirect(`/users/verified?status=error&message=`)
                    })
            }
        }

    } catch (error) {
        console.log(error);
        res.redirect(`/users/verified?message=`)
    }
}

export const requestPasswordReset = async (req, res, next) => {
    const { email } = req.body
    try {
        const user = await Users.findOne({ email })
        if (!user) {
            return res.status(404).json({
                status: "Failed",
                message: "Email Address  not  found "
            })
        }
        const exitPass = await PasswordReset.findOne({ email })
        if (exitPass) {
            if (exitPass?.expires_At > Date.now()) {
                return res.status(201).json({
                    status: "PENDING",
                    message: "Reset password link has already been sent tp your email.",
                });
            }
            await PasswordReset.findOneAndDelete({ email })
        }

        await resetPasswordLink(user, res)

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: message.error })
    }
}

export const resetPassword = async (req, res, next) => {
    const { userId, token } = req.params
    console.log(userId, "==userIdofpass", token);
    try {
        //find record
        const user = await Users.findById(userId)
        console.log(user, "===resetpassword user");
        if (!user) {
            const message = "Invalid password reset link. Try again";

            res.redirect(`/users/resetpassword?status=error&message=${message}`);

        }
        const resetPassword = await PasswordReset.findOne({ userId })
        if (!resetPassword) {
            const message = "Invalid password reset link. Try again";

            res.redirect(`/users/resetpassword?status=error&message=${message}`);

        }
        const { expires_At, token: resetpass } = resetPassword
        if (expires_At < Date.now()) {
            const message = "Reset Password link has expired. Please try again";

            res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
            const isMatch = await CompareString(token, resetpass);

            if (!isMatch) {
                const message = "Invalid reset password link. Please try again";

                res.redirect(`/users/resetpassword?status=error&message=${message}`);
            } else {

                res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const ChangePassword = async (req, res) => {
    const { userId, password } = req.body
    try {
        const hashPassword = await hashString(password)
        const user = await Users.findByIdAndUpdate({ _id: userId }, { password: hashPassword })
        if (user) {
            await PasswordReset.findOneAndDelete(userId)
            res.status(200).json({
                ok: true,
            });
        }

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}

export const getUser = async (req, res, next) => {
    try {
        const { userId } = req.body.user
        const { id } = req.params


        const user = await Users.findById(id ?? userId).populate({
            path: "friends",
            select: "-password",
        })
        if (!user) {
            return res.status(200).send({
                message: "User Not Found",
                success: false,
            });
        }
        user.password = undefined
        res.status(200).json({
            success: true,
            user: user,
        });

    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message, success: false });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, location, profileUrl, profession } = req.body;

        if (!(firstName || lastName || profession || location || profileUrl)) {
            next("Please provide all required fields");
            return;
        }
        const { userId } = req.body.user;
        const updateUser = {
            firstName,
            lastName,
            location,
            profileUrl,
            profession,
            _id: userId,
        };
        const user = await Users.findByIdAndUpdate(userId, updateUser, { new: true })
        await user.populate({ path: "friends", select: "-password" });
        const token = await creteJWT(user?._id);

        user.password = undefined;

        res.status(200).json({
            sucess: true,
            message: "User updated successfully",
            user,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
}


export const friendsRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user
        const { requestTo } = req.body

        const ExitResfrnd = await FriendsRequest.findOne({
            requestFrom: userId,
            requestTo
        })
        if (ExitResfrnd) {
            next("Friends request already exit")
            return
        }
        const accountExit = await FriendsRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId

        })
        if (accountExit) {
            next("Friends request already exit")
            return
        }
        const newRes = await FriendsRequest.create({
            requestTo,
            requestFrom: userId
        })

        res.status(201).json({
            success: true,
            message: "Friend Request sent successfully",
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
}
export const GetFriendsRequest = async (req, res, next) => {
    try {
        const { userId } = req.body.user
        console.log(userId, "from friendsrequest");
        const request = await FriendsRequest.find({
            requestTo: userId,
            requestStatus: "Pending",

        }).populate({
            path: "requestFrom",
            select: "firstName lastName   profession profileUrl -password"
        })
            .limit(10)
            .sort({ _id: -1 })
        res.status(201).json({
            success: true,
            data: request
        })
        console.log(request, "request");
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
}

export const AcceptRequest = async (req, res, next) => {
    try {
        const id = req.body.user.userId;
        const { rid, status } = req.body;
        console.log(rid, "rid");
        const exitFrndReq = await FriendsRequest.findById(rid)
        if (!exitFrndReq) {
            next("no friends is found")
            return
        }
        const newRes = await FriendsRequest.findByIdAndUpdate({
            _id: rid
        }, { requestStatus: status })

        if (status === "Accepted") {
            const user = await Users.findById(id)
            user.friends.push(newRes?.requestFrom)

            await user.save()

            const friend = await Users.findById(newRes?.requestFrom)

            friend.friends.push(newRes?.requestTo)

            await friend.save()
            res.status(201).json({
                success: true,
                message: "Friend Request " + status,
            });

        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
}

export const ProfileSec = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.body
        const user = await Users.findById(id)
        // Check if userId already exists in the views array
        if (!user.views.includes(userId)) {
            user.views.push(userId);
            await user.save();
        }
        console.log(userId, "==userId", id, "id");
        res.status(201).json({
            success: true,
            message: "Successfully",
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
}
export const Suggestion = async (req, res, next) => {
    try {
        const { userId } = req.body.user;
        let Queryobject = {}

        Queryobject._id = { $ne: userId }
        Queryobject.friends = { $nin: userId }
        let queryResult = Users.find(Queryobject)
            .limit(15)
            .select("firstName lastName profileUrl profession -password");
        const suggestedFriends = await queryResult;

        res.status(200).json({
            success: true,
            data: suggestedFriends,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "auth error",
            success: false,
            error: error.message,
        });
    }
}
export const CreateSocialLink = async (req, res, next) => {
    try {
        const { instagram, twitter, facebook, token } = req.body;
        const { userId } = req.body.user;

        console.log(userId, "===userId in the Social link");

        // Find existing social links for the user
        const existingUserLink = await SocialMediaLinkModel.findOne({ userId });

        console.log(existingUserLink, "===existingUserLink");

        if (existingUserLink) {
            // Update the social links if they are provided in the request
            const updateData = {
                instagram: instagram || existingUserLink.instagram,
                twitter: twitter || existingUserLink.twitter,
                facebook: facebook || existingUserLink.facebook,
            };

            console.log(updateData, "===updateData");

            // Update the document with new data
            const updatedData = await SocialMediaLinkModel.findByIdAndUpdate(
                existingUserLink._id,
                updateData,
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: updatedData,
            });
        } else {
            // Create a new document if no existing social links found for the user
            const newData = await SocialMediaLinkModel.create({
                userId,
                instagram,
                twitter,
                facebook,
                token,
            });

            res.status(200).json({
                success: true,
                data: newData,
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error creating or updating social links",
            success: false,
            error: error.message,
        });
    }
};
export const getSocialMediaLink = async(req , res , next) =>{
    try {
       const {userId} = req.params
       const getSocialLinks = await SocialLinkModel.findOne({userId})
       console.log(getSocialLinks ,"=====getSocialLink");
       res.status(200).json({
        success: true,
        data: getSocialLinks,
    });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error getting social links",
            success: false,
            error: error.message,
        });
    }
}
export default verifyEmail