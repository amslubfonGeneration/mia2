import nodemailer from 'nodemailer'
import { email_pass, email_to, email_user } from './config.js';


export const transporte = nodemailer.createTransport({
  service: 'gmail',
  host:'smtp.gmail.com',
  port: 587,
  secure:false,
  auth: {
    user: email_user,
    pass: email_pass,
  },
})


export const traitementMailPost = async (req, res) => {
    console.log(req.body)
    const { matricule,Contact,Commentaire } = req.body
    try {
    // Envoyer un e-mail avec Nodemailer
    await transporte.sendMail({
        from: `"Formulaire de contact" <${email_user}>`,
        to: email_to,
        subject: 'Contact support mia2tpNotes', // Sujet de l'e-mail
            text: `Matricule: ${matricule}\nContact/Email: ${Contact}\nMessage: ${Commentaire}`, // Contenu en texte brut
            html: `<p><strong>Matricule:</strong> ${matricule}</p>
                    <p><strong>Contact/Email:</strong> ${Contact}</p>
                    <p><strong>Message:</strong> ${Commentaire}</p>`
    });

    return res.view('template/email.ejs', {
        message_email: `votre message a été envoyé avec succes.Merci.`
    })
    }catch (error) {
        console.error(error);
        return res.view('template/email.ejs',{
            message_email: "Une erreur s'est produite lors de l'envoie de votre message.Vérifier votre connexion"
        })
    }
}
