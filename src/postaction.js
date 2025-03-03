import {verify, hash} from '@phc/argon2'
import { supabase } from './database.js';
import { email_to, email_user } from './config.js';
import {transporte} from './email.js'

export const AdmiconnectPost = async (req, res)=>{
    if(req.cookies.sessionDeConsent){
        res.clearCookie('sessionDeConsent',{
            Path:'/',
            secure:true,
            httpOnly:true,
            sameSite:'Strict'
        })
        return res.redirect('connectAdministration')
    }
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        const { data: admis, error: admisError } = await supabase
            .from('administration')
            .select('*')
        if(admisError){
            throw new Error("Une erreur s'est produite Réesayer")
        }
        if(
            admis !== undefined && 
            await verify(admis[0].password, req.body.password) &&
            admis[0].id === parseInt(req.body.id)
        ){ 
            req.session_adm.set('user_adm', {
                id: admis[0].id,
            })
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            return res.redirect('/')
        }else{
            return res.view('template/administration.ejs',{
                message_adm:"Identifiant ou mot de pass incorrect"
            })
        }
    }else{
        return res.view('template/administration.ejs',{
            message_adm:`
            Vous etes actuellement connecter a l'administration.`,
            admin:'connecté'
        })
    }   
}

export const AdmiRéinitialisationPost = async (req, res)=>{
    if(req.cookies.sessionDeConsent){
            res.clearCookie('sessionDeConsent',{
                Path:'/',
                secure:true,
                httpOnly:true,
                sameSite:'Strict'
            })
            return res.redirect('Réinitialisation')
    }
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.view('template/administration.ejs',{
            message_adm:`
            Echec de réinisialisation.Connecter Vous a l'administration pour continuer.`
        })
    }else{
        try {
            // Envoyer un e-mail a l'administration
            await transporte.sendMail({
                from: `"Inscription mia2tpNote" <${email_user}>`,
                to: email_to,
                subject: 'Contact support mia2tpNotes', // Sujet de l'e-mail
                    text: `Garder ses informations pour vos futures connexions en cas d'oublie de vos identifiants\nMatricule: ${req.body.id}\nContact/Email: ${req.body.email}\nMots de pass: ${req.body.password}`, // Contenu en texte brut
                    html: `<p><strong>Matricule:</strong> ${req.body.id}</p>
                        <p><strong>Nouveau Mot de pass:</strong> ${req.body.password}</p>`
            });
        }catch (error) {
            //console.error(error);
            if(error.message === 'Connection timeout'){
                throw new Error("Une erreur s'est produite Réesayer")
            }
            res.redirect('error.html')
        }
        const { error: deleteError } = await supabase
            .from('administration')
            .update({'id': parseInt(req.body.id), 'password':await hash(req.body.password)})
            .eq('id', req.session_adm.get('user_adm')?.id)
            if(deleteError){
                throw Error("Une erreur s'est produite Réesayer")
            }  
            req.session_adm.delete()
            res.setCookie('reinit','Réinitialisation réussit',{
                path:'/',
                httpOnly: true,
                secure: true,
                sameSite: 'Strict'
            })
            if(req.cookies.sessionConsent){
                res.clearCookie('sessionConsent',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
        return res.redirect('/')
    }
}
export const etuInscriptionPost = async (req, res)=>{
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        const id = parseInt(req.body.id)
        const password = await hash(req.body.password)
        const { data: admis, error: admisError } = await supabase
                .from('etudiants')
                .select('*')
                .eq('id',id)
                .single();
                if(admisError){
                    throw new Error("Une erreur s'est produite Réesayer")
                }
        if(admis.password === null){
            try {
                // Envoyer un e-mail avec Nodemailer
                await transporte.sendMail({
                    from: `"Inscription mia2tpNote" <${email_user}>`,
                    to: req.body.email,
                    subject: 'Contact support mia2tpNotes', // Sujet de l'e-mail
                        text: `Garder ses informations pour vos future connexion en cas d'oublie de vos identifiants\nMatricule: ${req.body.id}\nContact/Email: ${req.body.email}\nMots de pass: ${req.body.password}`, // Contenu en texte brut
                        html: `<p><strong>Matricule:</strong> ${req.body.id}</p>
                                <p><strong>Contact/Email:</strong> ${req.body.email}</p>
                                <p><strong>Mot de pass:</strong> ${req.body.password}</p>`
                });
            }catch (error) {
                //console.error(error);
                if(error.message === 'Connection timeout'){
                    throw new Error("Une erreur s'est produite Réesayer")
                }
                res.redirect('error.html')
            }
            const { error: insertError } = await supabase
                    .from('etudiants')
                    .update({password})
                    .eq('id', id)
            if(insertError){
                throw new Error("Une erreur s'est produite Réesayer")
            }
            res.setCookie('inscription','inscription réussit',{
                Path:'/',
                secure:true,
                httpOnly:true,
                sameSite:'Strict'
            })
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            return res.redirect('/')
        }else{
            return res.view('template/etu_inscription.ejs',{
                message_etu:`Matricule:${id} a déja un compte.`
            })
        }
    }else{
        return res.view('template/etu_inscription',{
            message_etu: `Matricule:${req.session_etu.get('user_etu')?.id},
            déconnecté vous d'abord pour effectuer cette action`
        })
    }
}
export const EtuconnectPost = async (req, res)=>{
    if(req.cookies.sessionDeConsent){
        res.clearCookie('sessionDeConsent',{
            Path:'/',
            secure:true,
            httpOnly:true,
            sameSite:'Strict'
        })
        return res.redirect('connectEtudiant')
    }
    if(req.session_etu.get('user_etu') === undefined || req.session_etu.get('user_etu') === null){
        const id = parseInt(req.body.id)
        const { data: admis, error: admisError } = await supabase
                .from('etudiants')
                .select('*')
                .eq('id',id)
                .single();
        if(admisError){
            throw new Error("Une erreur s'est produite Réesayer")
        }
        if(
                admis !== undefined && 
                await verify(admis.password, req.body.password)
        ){
            req.session_etu.set('user_etu', {
                    id: admis.id
            })
            if(req.cookies.boiteDeDialogue){
                res.clearCookie('boiteDeDialogue',{
                    Path:'/',
                    secure:true,
                    httpOnly:true,
                    sameSite:'Strict'
                })
            }
            res.redirect('/')
        }else{
            return res.view('template/etu_connection',{
                message_etu: "Echec de Connexion.Vérifier vos identifiants et réesssayer"
            })
        }
    }else{
        return res.view('template/etu_connection',{
            message_etu: `Matricule:${req.session_etu.get('user_etu')?.id},
            déconnecté vous d'abord pour cette action`
        })
    }
}
//Fonction destinée a inserer les informations des apprenants
export const administrerPost = async (req,res)=>{
    if(req.session_adm.get('user_adm') === undefined || req.session_adm.get('user_adm') === null){
        return res.view('template/administration.ejs',{
            message_adm:`
            Vous n'avez pas cette autorisation.Connecter Vous a l'administration pour continuer.`
        })
    }else{
        const { data: admis, error: admisError } = await supabase
                .from('administration')
                .select('*');
        if(admisError){
            throw Error("Une erreur s'est produite Réesayer")
        }
        if(await verify(admis[0].password, req.body.password)){ 
            const Note = parseInt(req.body.Note)
            const { data: admis, error: admisError } = await supabase
                    .from('etudiants')
                    .select('*')
                    .eq('id',parseInt(req.body.id))
                    .single();
            if(admisError){
                return res.view('template/administrer.ejs',{
                    message_adm:`Matricule:${req.body.id} n'existe pas`
                })
            }
            const { error: insertError } = await supabase
                .from('etudiants')
                .update({Note})
                .eq('id', parseInt(req.body.id))
            if(insertError){
                throw Error("Une erreur s'est produite Réesayer")
            }   
                return res.view('template/administrer.ejs',{
                    message_adm:`Ajout de l'étudiant ${req.body.id} \nNote:${req.body.Note}/20`
                })
        }else{
            return res.view('template/administrer.ejs',{
                message_adm:"Mots de pass incorrect"
            })
        }
    }
}
