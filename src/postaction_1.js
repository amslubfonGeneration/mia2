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
        console.log(admis[0].password,` ${typeof(admis[0].password)}`, '\n' ,typeof(req.body.password), '\n', await hash('administration'), typeof(await hash('administration')))
        
        if(
            admis !== undefined && 
            await verify(admis[0].password, req.body.password) &&
            admis[0].id === req.body.id
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
                from: `"Inscription MiaTpNote" <${email_user}>`,
                to: email_to,
                subject: 'Contact support miaTpNote', // Sujet de l'e-mail
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
            .update({'id': req.body.id, 'password':await hash(req.body.password)})
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

//Fonction destinée a inserer les informations des apprenants
export const administrerS2_S3_Post = async (req,res)=>{

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
            const {data, error} = await supabase
                .from('etudiants')
                .upsert([{
                    id: req.body.id
                }])
            if (error) throw Error("Une erreur s'est produite Réesayer")
            const Notes = req.body.physique
            console.log(req.session_adm.get('user_adm_info')?.Semestre_)
            const { data: admis, error: admisError } = await supabase
                    .from('note')
                    .select('Semestres',req.session_adm.get('user_adm_info')?.Semestre_)
                    .eq('id_etudiant',req.body.id)
                    .eq('matieres', 'TP_physique')
                    .single();
                    console.log(admisError, admis,'    gggggggggggggg')
            if(admisError === null || admisError.details === 'The result contains 0 rows'){
                const {data, error} = await supabase
                .from('note')
                .insert([{
                    id_etudiant: req.body.id,
                    Semestres: req.session_adm.get('user_adm_info')?.Semestre_,
                    matieres: 'TP_physique',
                    Notes: Notes
                }])
                if (error) throw Error("Une erreur s'est produite Réesayer")
                return res.view('template/administrerS2_S3.ejs',{
                    message_adm:`Ajout de l'étudiant ${req.body.id} \nNote:${Notes}/20`,
                    licence: req.session_adm.get('user_adm_info')?.Licence_,
                    semestre: req.session_adm.get('user_adm_info')?.Semestre_
                })
            }else{
                console.log('rrrrrrrrrrrrrrrr',)
            /*var newadmis = []
            if(Array.isArray(admis)){
                newadmis = admis
            }else{
                newadmis = Array(admis)
            }
            if(newadmis.find(item => item.Semestres === req.session_adm.get('user_adm_info')?.Semestre_) !== undefined){*/
                const { error: insertError } = await supabase
                .from('note')
                .update({Notes})
                .eq('id_etudiant', req.body.id)
                .eq('Semestres', req.session_adm.get('user_adm_info')?.Semestre_)
                .eq('matieres', 'TP_physique')

                if(insertError){
                    throw Error("Une erreur s'est produite Réesayer")
                }   
                return res.view('template/administrerS2_S3.ejs',{
                    message_adm:`Ajout de l'étudiant ${req.body.id} \nNote:${Notes}/20`,
                    licence: req.session_adm.get('user_adm_info')?.Licence_,
                    semestre: req.session_adm.get('user_adm_info')?.Semestre_
                })}
        }else{
            return res.view('template/administrerS2_S3.ejs',{
                message_adm:"Mots de pass incorrect"
            })
        }
    }
}

export const administrerS4Post = async (req,res)=>{
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

            const {data, error} = await supabase
                .from('etudiants')
                .upsert([{
                    id: req.body.id
                }])
            if (error) throw Error("Une erreur s'est produite Réesayer")
            console.log('ffffffffffff')
            const { data: admis, error: admisError } = await supabase
                    .from('note')
                    .select('Semestres', req.session_adm.get('user_adm_info')?.Semestre_)
                    .eq('id_etudiant',req.body.id)
                    .single();
                    console.log(admisError, admis, '    gggggggggggggg')
            if(admisError === null || admisError.details === 'The result contains 0 rows'){
                console.log('fffffffffffffffffffff')
                const {data, error} = await supabase
                .from('note')
                .insert([{
                    id_etudiant: req.body.id,
                    Semestres: req.session_adm.get('user_adm_info')?.Semestre_,
                    matieres: 'TP_python',
                    Notes: req.body.python
                },
            {
                    id_etudiant: req.body.id,
                    Semestres: req.session_adm.get('user_adm_info')?.Semestre_,
                    matieres: 'TP_scilab',
                    Notes: req.body.scilab
                },
            {
                    id_etudiant: req.body.id,
                    Semestres: req.session_adm.get('user_adm_info')?.Semestre_,
                    matieres: 'TP_latex',
                    Notes: req.body.latex
                }])

            console.log(error, data)
            if(error){
                throw Error("Une erreur s'est produite Réesayer")
            } 
            return res.view('template/administrerS4.ejs',{
                    message_adm:`Ajout de l'étudiant ${req.body.id} \nNote_Python:${req.body.python}/20,\nNote_scilab:${req.body.scilab}/20,\nNote_latex:${req.body.latex}/20`,
                    licence: req.session_adm.get('user_adm_info')?.Licence_,
                    semestre: req.session_adm.get('user_adm_info')?.Semestre_
            }) 
            }else{
                console.log('rrrrrrrrrrrr')
                const  { data:data1 ,error: error1 } = await supabase
                .from('note')
                .update({Notes: req.body.python})
                .eq('id_etudiant', req.body.id)
                .eq('Semestres',req.session_adm.get('user_adm_info')?.Semestre_)
                .eq('matieres', 'TP_python')
                
                const  { data:data2 ,error: error2 } = await supabase
                .from('note')
                .update({Notes: req.body.latex})
                .eq('id_etudiant', req.body.id)
                .eq('Semestres',req.session_adm.get('user_adm_info')?.Semestre_)
                .eq('matieres', 'TP_latex')

               const  { data:data3 ,error: error3 } = await supabase
                .from('note')
                .update({Notes: req.body.scilab})
                .eq('id_etudiant', req.body.id)
                .eq('Semestres', req.session_adm.get('user_adm_info')?.Semestre_)
                .eq('matieres', 'TP_scilab')
            
            if(error1 || error2 || error3){
                throw Error("Une erreur s'est produite Réesayer")
            }   
                return res.view('template/administrerS4.ejs',{
                    message_adm:`Ajout de l'étudiant ${req.body.id} \nNote_Python:${req.body.python}/20,\nNote_scilab:${req.body.scilab}/20,\nNote_latex:${req.body.latex}/20`,
                    licence: req.session_adm.get('user_adm_info')?.Licence_,
                    semestre: req.session_adm.get('user_adm_info')?.Semestre_
                })
            }
        }else{
            return res.view('template/administrerS4.ejs',{
                message_adm:"Mots de pass incorrect"
            })
        }
    }
}
  
