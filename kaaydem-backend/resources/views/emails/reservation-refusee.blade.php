<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Réservation refusée</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f1e4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f1e4;padding:32px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;">
                    <tr>
                        <td style="background-color:#ff7a1a;padding:24px 32px;">
                            <span style="color:#ffffff;font-size:20px;font-weight:bold;">Kaay Dem !</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <p style="margin:0 0 8px;color:#ff3b3b;font-weight:bold;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">
                                Réservation refusée
                            </p>
                            <p style="margin:0 0 20px;color:#16161d;font-size:16px;">
                                Bonjour {{ $passager->name }},
                            </p>
                            <p style="margin:0 0 20px;color:#16161d;font-size:15px;line-height:1.6;">
                                Le conducteur n'a malheureusement pas pu confirmer votre demande de réservation pour le trajet suivant.
                            </p>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffe3e3;border-radius:12px;padding:16px;margin-bottom:20px;">
                                <tr>
                                    <td style="padding:16px;">
                                        <p style="margin:0;color:#16161d;font-size:16px;font-weight:bold;">
                                            {{ $trajet->ville_depart }} &rarr; {{ $trajet->ville_arrivee }}
                                        </p>
                                        <p style="margin:6px 0 0;color:#16161d99;font-size:13px;">
                                            Départ le {{ \Illuminate\Support\Carbon::parse($trajet->date_heure_depart)->translatedFormat('l j F Y à H:i') }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0;color:#16161d99;font-size:13px;line-height:1.6;">
                                Aucune place n'a été débitée. N'hésitez pas à chercher un autre trajet disponible sur Kaay Dem !
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
