import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import {
    Instagram,
    Facebook,
    Twitter,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

import Logo from '../ui/logo';

export default function Footer() {
    return (
        <footer className="bg-gray-50 pt-12 pb-8 border-t">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Logo size="large" />
                        <p className="text-gray-600 mt-2">
                            Conectando você aos melhores produtos frescos diretamente dos produtores.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-green-600 transition-colors">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to={createPageUrl("Home")} className="text-gray-600 hover:text-green-600 transition-colors">
                                    Início
                                </Link>
                            </li>
                            <li>
                                <Link to={createPageUrl("Products")} className="text-gray-600 hover:text-green-600 transition-colors">
                                    Produtos
                                </Link>
                            </li>
                            <li>
                                <Link to={createPageUrl("About")} className="text-gray-600 hover:text-green-600 transition-colors">
                                    Sobre Nós
                                </Link>
                            </li>
                            <li>
                                <Link to={createPageUrl("Contact")} className="text-gray-600 hover:text-green-600 transition-colors">
                                    Contato
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Categorias</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to={createPageUrl("Products") + "?category=frutas"}
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    Frutas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={createPageUrl("Products") + "?category=legumes"}
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    Legumes
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={createPageUrl("Products") + "?category=verduras"}
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    Verduras
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to={createPageUrl("Products") + "?category=outros"}
                                    className="text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    Outros Produtos
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg mb-4">Contato</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start">
                                <MapPin className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                                <span className="text-gray-600">
                                    Rua das Frutas, 123<br />
                                    Jardim Botânico, Rio de Janeiro
                                </span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-gray-600">(21) 99999-9999</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-gray-600">contato@fruitbox.com.br</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-10 pt-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-500 text-sm">
                            &copy; {new Date().getFullYear()} FruitBox. Todos os direitos reservados.
                        </p>
                        <div className="flex space-x-4 mt-4 md:mt-0">
                            <Link to={createPageUrl("Terms")} className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                                Termos de Uso
                            </Link>
                            <Link to={createPageUrl("Privacy")} className="text-gray-500 text-sm hover:text-green-600 transition-colors">
                                Política de Privacidade
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}